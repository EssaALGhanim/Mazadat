package org.example.mazadat.Repository;

import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.List;

@Repository
public interface SellerRepository extends JpaRepository<Seller,Integer> {
    Seller findSellerById(Integer id);
    Seller findSellerByUserUsername(String username);
    Seller findSellerByUserEmail(String email);
    List<Seller> findByAuctionHouseId(Integer auctionHouseId);
    List<Seller> findByPendingAuctionHouseIdAndInvitationStatus(Integer auctionHouseId, String invitationStatus);

    @Query("SELECT s FROM Seller s WHERE s.isAdmin = true AND s.auctionHouse = ?1 AND s <> ?2")
    Set<Seller> findOtherAuctionHouseAdmins(AuctionHouse auctionHouse, Seller seller);

    @Query("SELECT s FROM Seller s WHERE s.isAdmin = true AND s.auctionHouse.id = ?1")
    List<Seller> findAdminsByAuctionHouseId(Integer auctionHouseId);
}