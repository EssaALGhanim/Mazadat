package org.example.mazadat.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AuctionCommentDTOIN;
import org.example.mazadat.DTOOUT.AuctionCommentDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AuctionComment;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionCommentRepository;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.UserRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuctionCommentServiceTest {

    @Mock
    private AuctionCommentRepository commentRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuctionCommentService commentService;

    // ─── getComments ──────────────────────────────────────────────────────────

    @Test
    void getCommentsThrowsWhenAuctionNotFound() {
        when(auctionRepository.existsById(99)).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.getComments(99));

        assertEquals("Auction not found", ex.getMessage());
        verify(commentRepository, never()).findByAuctionIdOrderByCreatedAtAsc(anyInt());
    }

    @Test
    void getCommentsReturnsEmptyListWhenNoComments() {
        when(auctionRepository.existsById(1)).thenReturn(true);
        when(commentRepository.findByAuctionIdOrderByCreatedAtAsc(1)).thenReturn(List.of());

        List<AuctionCommentDTOOUT> result = commentService.getComments(1);

        assertTrue(result.isEmpty());
    }

    @Test
    void getCommentsMapsFieldsCorrectly() {
        Auction auction = buildAuction(1);
        User user = buildUser(10, "buyerX", "BUYER");
        AuctionComment comment = buildComment(5, user, auction, "Is this item new?");

        when(auctionRepository.existsById(1)).thenReturn(true);
        when(commentRepository.findByAuctionIdOrderByCreatedAtAsc(1)).thenReturn(List.of(comment));

        List<AuctionCommentDTOOUT> result = commentService.getComments(1);

        assertEquals(1, result.size());
        AuctionCommentDTOOUT dto = result.get(0);
        assertEquals(5, dto.id());
        assertEquals(1, dto.auctionId());
        assertEquals("buyerX", dto.username());
        assertEquals("Is this item new?", dto.content());
    }

    // ─── addComment ───────────────────────────────────────────────────────────

    @Test
    void addCommentSucceedsForBuyer() {
        when(userRepository.findById(1)).thenReturn(Optional.of(buildUser(1, "buyer1", "BUYER")));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(buildAuction(10)));

        commentService.addComment(buildDto("Is it available?"), 10, 1);

        verify(commentRepository).save(any(AuctionComment.class));
    }

    @Test
    void addCommentSucceedsForSeller() {
        when(userRepository.findById(2)).thenReturn(Optional.of(buildUser(2, "seller1", "SELLER")));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(buildAuction(10)));

        commentService.addComment(buildDto("Item is brand new."), 10, 2);

        verify(commentRepository).save(any(AuctionComment.class));
    }

    @Test
    void addCommentThrowsForAdmin() {
        when(userRepository.findById(3)).thenReturn(Optional.of(buildUser(3, "admin1", "ADMIN")));

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.addComment(buildDto("test"), 10, 3));

        assertEquals("Only buyers and sellers can add comments", ex.getMessage());
        verify(commentRepository, never()).save(any());
    }

    @Test
    void addCommentThrowsWhenUserNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.addComment(buildDto("test"), 10, 99));

        assertEquals("User not found", ex.getMessage());
        verify(commentRepository, never()).save(any());
    }

    @Test
    void addCommentThrowsWhenAuctionNotFound() {
        when(userRepository.findById(1)).thenReturn(Optional.of(buildUser(1, "buyer1", "BUYER")));
        when(auctionRepository.findById(99)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.addComment(buildDto("test"), 99, 1));

        assertEquals("Auction not found", ex.getMessage());
        verify(commentRepository, never()).save(any());
    }

    // ─── editComment ──────────────────────────────────────────────────────────

    @Test
    void editCommentSucceedsForOwner() {
        User owner = buildUser(1, "buyer1", "BUYER");
        AuctionComment comment = buildComment(5, owner, buildAuction(10), "original");

        when(commentRepository.findById(5)).thenReturn(Optional.of(comment));

        commentService.editComment(buildDto("updated content"), 5, 1);

        assertEquals("updated content", comment.getContent());
        verify(commentRepository).save(comment);
    }

    @Test
    void editCommentThrowsForNonOwner() {
        User owner = buildUser(1, "buyer1", "BUYER");
        AuctionComment comment = buildComment(5, owner, buildAuction(10), "original");

        when(commentRepository.findById(5)).thenReturn(Optional.of(comment));

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.editComment(buildDto("hack"), 5, 99));

        assertEquals("Not authorized to edit this comment", ex.getMessage());
        verify(commentRepository, never()).save(any());
    }

    @Test
    void editCommentThrowsWhenCommentNotFound() {
        when(commentRepository.findById(99)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.editComment(buildDto("test"), 99, 1));

        assertEquals("Comment not found", ex.getMessage());
    }

    // ─── deleteComment ────────────────────────────────────────────────────────

    @Test
    void deleteCommentSucceedsForOwner() {
        User owner = buildUser(1, "buyer1", "BUYER");
        AuctionComment comment = buildComment(5, owner, buildAuction(10), "hello");

        when(commentRepository.findById(5)).thenReturn(Optional.of(comment));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));

        commentService.deleteComment(5, 1);

        verify(commentRepository).delete(comment);
    }

    @Test
    void deleteCommentSucceedsForAdmin() {
        User owner = buildUser(1, "buyer1", "BUYER");
        User admin = buildUser(2, "admin1", "ADMIN");
        AuctionComment comment = buildComment(5, owner, buildAuction(10), "hello");

        when(commentRepository.findById(5)).thenReturn(Optional.of(comment));
        when(userRepository.findById(2)).thenReturn(Optional.of(admin));

        commentService.deleteComment(5, 2);

        verify(commentRepository).delete(comment);
    }

    @Test
    void deleteCommentThrowsForNonOwnerNonAdmin() {
        User owner = buildUser(1, "buyer1", "BUYER");
        User other = buildUser(3, "buyer2", "BUYER");
        AuctionComment comment = buildComment(5, owner, buildAuction(10), "hello");

        when(commentRepository.findById(5)).thenReturn(Optional.of(comment));
        when(userRepository.findById(3)).thenReturn(Optional.of(other));

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.deleteComment(5, 3));

        assertEquals("Not authorized to delete this comment", ex.getMessage());
        verify(commentRepository, never()).delete(any());
    }

    @Test
    void deleteCommentThrowsWhenCommentNotFound() {
        when(commentRepository.findById(99)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> commentService.deleteComment(99, 1));

        assertEquals("Comment not found", ex.getMessage());
        verify(commentRepository, never()).delete(any());
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private User buildUser(int id, String username, String role) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setRole(role);
        return user;
    }

    private Auction buildAuction(int id) {
        Auction auction = new Auction();
        auction.setId(id);
        return auction;
    }

    private AuctionComment buildComment(int id, User user, Auction auction, String content) {
        AuctionComment comment = new AuctionComment();
        comment.setId(id);
        comment.setUser(user);
        comment.setAuction(auction);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        return comment;
    }

    private AuctionCommentDTOIN buildDto(String content) {
        AuctionCommentDTOIN dto = new AuctionCommentDTOIN();
        dto.setContent(content);
        return dto;
    }
}
