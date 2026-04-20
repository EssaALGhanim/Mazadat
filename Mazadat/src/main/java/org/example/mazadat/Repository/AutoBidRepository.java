package org.example.mazadat.Repository;

import org.example.mazadat.Model.AutoBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AutoBidRepository extends JpaRepository<AutoBid, Integer> {

    // Best competing auto-bid for an auction that does NOT belong to the current highest bidder
    @Query("""
            SELECT ab FROM AutoBid ab
            WHERE ab.auction.id = :auctionId
              AND ab.active = true
              AND ab.buyer.user.username <> :highestBidder
            ORDER BY ab.maxAmount DESC
            """)
    Optional<AutoBid> findBestCompetingAutoBid(@Param("auctionId") Integer auctionId,
                                               @Param("highestBidder") String highestBidder);

    // Find a buyer's active auto-bid for a specific auction
    Optional<AutoBid> findByBuyerIdAndAuctionIdAndActiveTrue(Integer buyerId, Integer auctionId);

    // List all active auto-bids for a buyer
    List<AutoBid> findByBuyerIdAndActiveTrue(Integer buyerId);

    // All active auto-bids on an auction (for cleanup after chain resolution)
    @Query("""
            SELECT ab FROM AutoBid ab
            WHERE ab.auction.id = :auctionId
              AND ab.active = true
              AND ab.buyer.user.username <> :highestBidder
              AND ab.maxAmount < :nextMin
            """)
    List<AutoBid> findExhaustedAutoBids(@Param("auctionId") Integer auctionId,
                                        @Param("highestBidder") String highestBidder,
                                        @Param("nextMin") Double nextMin);
}
