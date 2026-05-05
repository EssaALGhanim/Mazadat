package org.example.mazadat.Repository;

import java.util.List;
import java.util.Optional;

import org.example.mazadat.Model.BuyerRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuyerRatingRepository extends JpaRepository<BuyerRating, Integer> {

    Optional<BuyerRating> findByAuctionId(Integer auctionId);

    List<BuyerRating> findByBuyerId(Integer buyerId);
}
