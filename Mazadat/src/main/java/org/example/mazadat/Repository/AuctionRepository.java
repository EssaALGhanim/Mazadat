package org.example.mazadat.Repository;

import java.util.List;

import org.example.mazadat.Model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

	@Modifying
	@Query("UPDATE Auction a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
	void incrementViewCount(@Param("id") Integer id);

	@Modifying
	@Query("UPDATE Auction a SET a.highestBidder = :newUsername WHERE a.highestBidder = :oldUsername")
	int updateHighestBidderUsername(@Param("oldUsername") String oldUsername, @Param("newUsername") String newUsername);
}