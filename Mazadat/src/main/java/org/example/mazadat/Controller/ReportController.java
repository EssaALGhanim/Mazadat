package org.example.mazadat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.ReportDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.ReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<?> submitReport(@Valid @RequestBody ReportDTOIN dto,
                                          @AuthenticationPrincipal User user) {
        reportService.submitReport(user.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Report submitted successfully"));
    }
}
