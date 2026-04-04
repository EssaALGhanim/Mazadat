package org.example.mazadat.Repository;

import java.util.List;

import org.example.mazadat.Model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image,Integer> {

	List<Image> findByAuctionIdOrderByDisplayOrderAsc(Integer auctionId);

	List<Image> findByAuctionId(Integer auctionId);

	void deleteByAuctionId(Integer auctionId);
}