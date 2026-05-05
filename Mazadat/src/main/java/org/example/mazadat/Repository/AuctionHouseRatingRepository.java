package org.example.mazadat.Repository;

import java.util.List;
import java.util.Optional;

import org.example.mazadat.Model.AuctionHouseRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionHouseRatingRepository extends JpaRepository<AuctionHouseRating, Integer> {

    Optional<AuctionHouseRating> findByBuyerIdAndAuctionId(Integer buyerId, Integer auctionId);

    List<AuctionHouseRating> findByAuctionHouseId(Integer auctionHouseId);
}
