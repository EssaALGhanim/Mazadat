package org.example.mazadat.Repository;

import org.example.mazadat.Model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {

    List<Report> findAllByOrderByCreatedAtDesc();

    boolean existsByReporterIdAndAuctionId(Integer reporterId, Integer auctionId);

    @Modifying
    @Query("UPDATE Report r SET r.auction = null WHERE r.auction.id = :auctionId")
    void nullifyAuctionReference(@Param("auctionId") Integer auctionId);

    @Modifying
    @Query("UPDATE Report r SET r.reporter = null WHERE r.reporter.id = :reporterId")
    void nullifyReporterReference(@Param("reporterId") Integer reporterId);
}
