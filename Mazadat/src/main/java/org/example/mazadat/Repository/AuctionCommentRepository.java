package org.example.mazadat.Repository;

import java.util.List;

import org.example.mazadat.Model.AuctionComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionCommentRepository extends JpaRepository<AuctionComment, Integer> {

    List<AuctionComment> findByAuctionIdOrderByCreatedAtAsc(Integer auctionId);
}
