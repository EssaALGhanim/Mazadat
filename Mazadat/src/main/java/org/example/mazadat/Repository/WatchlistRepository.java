package org.example.mazadat.Repository;

import java.util.List;
import java.util.Optional;

import org.example.mazadat.Model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Integer> {

    List<Watchlist> findByBuyerId(Integer buyerId);

    boolean existsByBuyerIdAndAuctionId(Integer buyerId, Integer auctionId);

    Optional<Watchlist> findByBuyerIdAndAuctionId(Integer buyerId, Integer auctionId);
}
