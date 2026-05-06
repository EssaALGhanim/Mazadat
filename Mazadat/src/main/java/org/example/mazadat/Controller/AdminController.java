package org.example.mazadat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AdminEmailDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.AdminService;
import org.example.mazadat.Service.ReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Integer userId) {
        User user = adminService.getAdminUserById(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/{userId}/deletion-warning")
    public ResponseEntity<Map<String, Object>> getUserDeletionWarning(@PathVariable Integer userId) {
        Map<String, Object> warning = adminService.getUserDeletionWarning(userId);
        return ResponseEntity.ok(warning);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/auctions/{auctionId}")
    public ResponseEntity<?> deleteAuction(@PathVariable Integer auctionId) {
        adminService.deleteAuction(auctionId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // ── Report endpoints ──────────────────────────────────────────────────────

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PostMapping("/reports/{reportId}/email-reporter")
    public ResponseEntity<?> emailReporter(@PathVariable Integer reportId,
                                           @Valid @RequestBody(required = false) AdminEmailDTOIN dto) {
        String msg = dto != null ? dto.getCustomMessage() : null;
        reportService.sendEmailToReporter(reportId, msg);
        return ResponseEntity.ok(new ApiResponse("Email sent to reporter"));
    }

    @PostMapping("/reports/{reportId}/email-auction-house")
    public ResponseEntity<?> emailAuctionHouse(@PathVariable Integer reportId,
                                               @Valid @RequestBody(required = false) AdminEmailDTOIN dto) {
        String msg = dto != null ? dto.getCustomMessage() : null;
        reportService.sendEmailToAuctionHouse(reportId, msg);
        return ResponseEntity.ok(new ApiResponse("Email sent to auction house admins"));
    }

    @DeleteMapping("/reports/{reportId}/auction")
    public ResponseEntity<?> deleteReportedAuction(@PathVariable Integer reportId) {
        reportService.deleteReportedAuction(reportId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/reports/{reportId}/dismiss")
    public ResponseEntity<?> dismissReport(@PathVariable Integer reportId) {
        reportService.dismissReport(reportId);
        return ResponseEntity.ok(new ApiResponse("Report dismissed"));
    }
}
