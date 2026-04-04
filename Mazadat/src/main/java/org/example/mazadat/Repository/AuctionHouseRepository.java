package org.example.mazadat.Repository;


import org.example.mazadat.Model.AuctionHouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionHouseRepository extends JpaRepository<AuctionHouse,Integer> {

}
