package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.ReportDTOIN;
import org.example.mazadat.DTOOUT.ReportDTOOUT;
import org.example.mazadat.Model.*;
import org.example.mazadat.Repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ReportRepository reportRepository;
    private final AuctionRepository auctionRepository;
    private final SellerRepository sellerRepository;
    private final BuyerRepository buyerRepository;
    private final AuctionHouseRepository auctionHouseRepository;
    private final AdminService adminService;
    private final EmailService emailService;

    // ── Buyer: submit a report ────────────────────────────────────────────────

    @Transactional
    public void submitReport(Integer userId, ReportDTOIN dto) {
        Buyer buyer = buyerRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Only buyers can submit reports"));

        Auction auction = auctionRepository.findById(dto.getAuctionId())
                .orElseThrow(() -> new ApiException("Auction not found"));

        if (reportRepository.existsByReporterIdAndAuctionId(userId, dto.getAuctionId())) {
            throw new ApiException("You have already reported this listing");
        }

        User reporterUser = buyer.getUser();
        User sellerUser   = auction.getSeller() != null ? auction.getSeller().getUser() : null;

        Report report = new Report();
        report.setReporter(reporterUser);
        report.setReporterUsername(reporterUser.getUsername());
        report.setReporterEmail(reporterUser.getEmail());
        report.setAuction(auction);
        report.setAuctionTitle(auction.getTitle());
        report.setSellerUsername(sellerUser != null ? sellerUser.getUsername() : "");
        report.setSellerEmail(sellerUser != null ? sellerUser.getEmail() : null);
        report.setAuctionHouseName(auction.getAuctionHouseName());
        report.setMessage(dto.getMessage());
        report.setStatus("PENDING");
        reportRepository.save(report);

        logger.info("REPORT_SUBMITTED: reportId={} reporter={} auctionId={} auctionTitle={}",
                report.getId(), reporterUser.getUsername(), auction.getId(), auction.getTitle());
    }

    // ── Admin: list all reports ───────────────────────────────────────────────

    public List<ReportDTOOUT> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ── Admin: send email to reporter ─────────────────────────────────────────

    @Transactional
    public void sendEmailToReporter(Integer reportId, String customMessage) {
        Report report = findReport(reportId);

        emailService.sendReportAcknowledgementEmail(
                report.getReporterEmail(),
                report.getReporterUsername(),
                report.getAuctionTitle(),
                customMessage
        );

        markReviewed(report);

        logger.info("REPORT_EMAIL_REPORTER: reportId={} sentTo={}", reportId, report.getReporterEmail());
    }

    // ── Admin: send email to all auction house admins ─────────────────────────

    @Transactional
    public void sendEmailToAuctionHouse(Integer reportId, String customMessage) {
        Report report = findReport(reportId);

        List<String[]> recipients = resolveAuctionHouseAdminEmails(report);
        if (recipients.isEmpty()) {
            throw new ApiException("No admin emails found for this auction house — the auction may have been removed");
        }

        for (String[] rec : recipients) {
            String email    = rec[0];
            String username = rec[1];
            emailService.sendAuctionHouseReportEmail(
                    email,
                    username,
                    report.getAuctionTitle(),
                    report.getAuctionHouseName(),
                    report.getMessage(),
                    customMessage
            );
        }

        markReviewed(report);

        String sentTo = String.join(", ", recipients.stream().map(r -> r[0]).toList());
        logger.info("REPORT_EMAIL_AUCTION_HOUSE: reportId={} sentTo=[{}]", reportId, sentTo);
    }

    // ── Admin: delete the reported auction ────────────────────────────────────

    @Transactional
    public void deleteReportedAuction(Integer reportId) {
        Report report = findReport(reportId);

        if (report.getAuction() == null) {
            throw new ApiException("The reported auction no longer exists");
        }

        Integer auctionId   = report.getAuction().getId();
        String  auctionTitle = report.getAuctionTitle();

        // deleteAuction internally calls deleteAuctionDependencies which nullifies
        // all report→auction FKs and then clears the JPA persistence context.
        // Do NOT call nullifyAuctionReference here — that would clear the PC early
        // and leave `report` as a detached entity with a stale auction reference
        // that Hibernate would try to re-flush before the auction DELETE.
        adminService.deleteAuction(auctionId);

        // Re-fetch report — the PC was cleared inside deleteAuction, so the local
        // `report` variable is now a detached instance with stale auction reference.
        report = reportRepository.findById(reportId).orElse(null);
        if (report != null) {
            report.setStatus("REVIEWED");
            report.setResolvedAt(LocalDateTime.now());
            reportRepository.save(report);
        }

        logger.info("REPORT_AUCTION_DELETED: reportId={} auctionId={} auctionTitle={}",
                reportId, auctionId, auctionTitle);
    }

    // ── Admin: dismiss report ─────────────────────────────────────────────────

    @Transactional
    public void dismissReport(Integer reportId) {
        Report report = findReport(reportId);
        report.setStatus("DISMISSED");
        report.setResolvedAt(LocalDateTime.now());
        reportRepository.save(report);

        logger.info("REPORT_DISMISSED: reportId={}", reportId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Report findReport(Integer reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ApiException("Report not found"));
    }

    private void markReviewed(Report report) {
        if ("PENDING".equals(report.getStatus())) {
            report.setStatus("REVIEWED");
            report.setResolvedAt(LocalDateTime.now());
            reportRepository.save(report);
        }
    }

    /**
     * Collects [email, username] pairs for every admin of the auction house.
     * Strategy:
     *  1. If the auction is still live, query all Seller admins of the house.
     *  2. Otherwise fall back to the denormalized seller snapshot on the report.
     * Returns a list so all admins receive the email, not just one.
     */
    private List<String[]> resolveAuctionHouseAdminEmails(Report report) {
        List<String[]> results = new ArrayList<>();

        if (report.getAuction() != null && report.getAuction().getAuctionHouseId() != null) {
            Integer houseId = report.getAuction().getAuctionHouseId();
            List<Seller> admins = sellerRepository.findAdminsByAuctionHouseId(houseId);
            for (Seller admin : admins) {
                if (admin.getUser() != null
                        && admin.getUser().getEmail() != null
                        && !admin.getUser().getEmail().isBlank()) {
                    results.add(new String[]{
                        admin.getUser().getEmail(),
                        admin.getUser().getUsername()
                    });
                }
            }
        }

        // Fall back to the denormalized snapshot when no live admins were found
        if (results.isEmpty() && report.getSellerEmail() != null && !report.getSellerEmail().isBlank()) {
            results.add(new String[]{report.getSellerEmail(), report.getSellerUsername()});
        }

        return results;
    }

    private ReportDTOOUT toDto(Report report) {
        return new ReportDTOOUT(
                report.getId(),
                report.getStatus(),
                report.getReporterUsername(),
                report.getReporterEmail(),
                report.getAuction() != null ? report.getAuction().getId() : null,
                report.getAuctionTitle(),
                report.getSellerUsername(),
                report.getSellerEmail(),
                report.getAuctionHouseName(),
                report.getMessage(),
                report.getCreatedAt(),
                report.getResolvedAt(),
                report.getAuction() != null
        );
    }
}
