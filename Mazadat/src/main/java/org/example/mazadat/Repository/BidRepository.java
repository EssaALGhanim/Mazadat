package org.example.mazadat.Repository;

import org.example.mazadat.Model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid,Integer> {
    @Query("""
            SELECT b FROM Bid b
            WHERE b.buyer.id = :buyerId
              AND b.amount = (
                    SELECT MAX(b2.amount)
                    FROM Bid b2
                    WHERE b2.buyer.id = :buyerId
                      AND b2.auction.id = b.auction.id
              )
              AND b.placedAt = (
                    SELECT MAX(b3.placedAt)
                    FROM Bid b3
                    WHERE b3.buyer.id = :buyerId
                      AND b3.auction.id = b.auction.id
                      AND b3.amount = b.amount
              )
              AND b.id = (
                    SELECT MAX(b4.id)
                    FROM Bid b4
                    WHERE b4.buyer.id = :buyerId
                      AND b4.auction.id = b.auction.id
                      AND b4.amount = b.amount
                      AND b4.placedAt = b.placedAt
              )
            ORDER BY b.placedAt DESC
            """)
    List<Bid> findHighestBuyerBidPerAuction(@Param("buyerId") Integer buyerId);

    Optional<Bid> findTopByAuctionIdOrderByAmountDescPlacedAtDesc(Integer auctionId);

    boolean existsByAuctionId(Integer auctionId);

    @Query("""
            SELECT b FROM Bid b
            WHERE b.buyer.id = :buyerId
              AND (
                    (b.auction.endDate IS NOT NULL AND b.auction.endDate <= :now)
                    OR UPPER(COALESCE(b.auction.status, '')) = 'ENDED'
                    OR UPPER(COALESCE(b.auction.status, '')) = 'COMPLETED'
              )
              AND (
                    b.auction.reservePrice IS NULL
                    OR b.auction.currentPrice >= b.auction.reservePrice
              )
              AND NOT EXISTS (
                    SELECT 1
                    FROM Bid b2
                    WHERE b2.auction.id = b.auction.id
                      AND (
                            b2.amount > b.amount
                            OR (b2.amount = b.amount AND b2.placedAt > b.placedAt)
                            OR (b2.amount = b.amount AND b2.placedAt = b.placedAt AND b2.id > b.id)
                      )
              )
            ORDER BY b.placedAt DESC
            """)
    List<Bid> findWonHighestBuyerBidPerAuction(@Param("buyerId") Integer buyerId, @Param("now") LocalDateTime now);

    @Query("""
            SELECT COUNT(DISTINCT b.buyer.id)
            FROM Bid b
            WHERE b.ipAddress = :ipAddress
            """)
    long countDistinctBuyerIdsByIpAddress(@Param("ipAddress") String ipAddress);

    @Query("""
            SELECT COUNT(b) > 0
            FROM Bid b
            WHERE b.buyer.id = :buyerId
              AND b.ipAddress = :ipAddress
            """)
    boolean existsByBuyerIdAndIpAddress(@Param("buyerId") Integer buyerId, @Param("ipAddress") String ipAddress);

    @Query("""
            SELECT COUNT(DISTINCT b.buyer.id)
            FROM Bid b
            WHERE b.deviceFingerprint = :deviceFingerprint
            """)
    long countDistinctBuyerIdsByDeviceFingerprint(@Param("deviceFingerprint") String deviceFingerprint);

    @Query("""
            SELECT COUNT(b) > 0
            FROM Bid b
            WHERE b.buyer.id = :buyerId
              AND b.deviceFingerprint = :deviceFingerprint
            """)
    boolean existsByBuyerIdAndDeviceFingerprint(@Param("buyerId") Integer buyerId, @Param("deviceFingerprint") String deviceFingerprint);
}