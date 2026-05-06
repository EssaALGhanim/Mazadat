package org.example.mazadat.Repository;

import org.example.mazadat.Model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction,Integer> {

	@Query("""
			SELECT DISTINCT a
			FROM Auction a
			LEFT JOIN a.seller s
			LEFT JOIN s.user u
			LEFT JOIN a.auctionHouse ah
			WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%'))
				OR LOWER(COALESCE(a.description, '')) LIKE LOWER(CONCAT('%', :query, '%'))
				OR LOWER(COALESCE(u.username, '')) LIKE LOWER(CONCAT('%', :query, '%'))
				OR LOWER(COALESCE(ah.name, '')) LIKE LOWER(CONCAT('%', :query, '%'))
			ORDER BY a.createdAt DESC
			""")
	List<Auction> searchByQuery(@Param("query") String query);

	@Query("""
			SELECT a FROM Auction a
			WHERE a.isFeatured = true
			AND a.featuredEndDate > CURRENT_TIMESTAMP
			ORDER BY FUNCTION('RAND')
			LIMIT 3
			""")
	List<Auction> findRandomFeaturedAuctions();

	@Query("""
			SELECT a FROM Auction a
			WHERE a.seller.id = :sellerId
			AND a.isFeatured = true
			AND a.featuredEndDate > CURRENT_TIMESTAMP
			ORDER BY a.featuredEndDate DESC
			""")
	List<Auction> findActiveFeaturedBySellerIdOrderByEndDate(@Param("sellerId") Integer sellerId);

	@Query("""
			SELECT a FROM Auction a
			WHERE a.highestBidder = :username
			  AND a.status IN ('ACTIVE', 'PENDING')
			""")
	List<Auction> findActiveAuctionsByHighestBidder(@Param("username") String username);

	List<Auction> findBySellerId(Integer sellerId);
}