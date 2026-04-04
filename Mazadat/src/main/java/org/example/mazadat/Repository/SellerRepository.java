package org.example.mazadat.Repository;

import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface SellerRepository extends JpaRepository<Seller,Integer> {
    Seller findSellerById(Integer id);

    @Query("SELECT s FROM Seller s WHERE s.isAdmin = true AND s.auctionHouse = ?1 AND s <> ?2")
    Set<Seller> findOtherAuctionHouseAdmins(AuctionHouse auctionHouse, Seller seller);
}