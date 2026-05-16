package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AuctionCommentDTOIN;
import org.example.mazadat.DTOOUT.AuctionCommentDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AuctionComment;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionCommentRepository;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionCommentService {

    private final AuctionCommentRepository commentRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    public List<AuctionCommentDTOOUT> getComments(int auctionId) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new ApiException("Auction not found");
        }
        return commentRepository.findByAuctionIdOrderByCreatedAtAsc(auctionId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void addComment(AuctionCommentDTOIN dto, int auctionId, int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        if (!user.getRole().equals("BUYER") && !user.getRole().equals("SELLER")) {
            throw new ApiException("Only buyers and sellers can add comments");
        }

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ApiException("Auction not found"));

        AuctionComment comment = new AuctionComment();
        comment.setContent(dto.getContent());
        comment.setAuction(auction);
        comment.setUser(user);

        commentRepository.save(comment);
    }

    @Transactional
    public void editComment(AuctionCommentDTOIN dto, int commentId, int userId) {
        AuctionComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new ApiException("Not authorized to edit this comment");
        }

        comment.setContent(dto.getContent());
        commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(int commentId, int userId) {
        AuctionComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException("Comment not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        boolean isOwner = comment.getUser().getId().equals(userId);
        boolean isAdmin = user.getRole().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new ApiException("Not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private AuctionCommentDTOOUT toDto(AuctionComment comment) {
        return new AuctionCommentDTOOUT(
                comment.getId(),
                comment.getAuction().getId(),
                comment.getUser().getUsername(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
