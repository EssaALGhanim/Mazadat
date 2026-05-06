package org.example.mazadat.Controller;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.PhoneVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user/phone")
@RequiredArgsConstructor
public class PhoneVerificationController {

    private final PhoneVerificationService phoneVerificationService;

    /** Sends an OTP to the logged-in user's phone number. */
    @PostMapping("/verify/send")
    public ResponseEntity<?> sendOtp(@AuthenticationPrincipal User user) {
        phoneVerificationService.sendVerificationOtp(user.getId());
        return ResponseEntity.ok(new ApiResponse("OTP sent to your phone number"));
    }

    /** Verifies the OTP entered by the user and marks phone as verified. */
    @PostMapping("/verify/confirm")
    public ResponseEntity<?> confirmOtp(@AuthenticationPrincipal User user,
                                        @RequestBody Map<String, String> body) {
        String otp = body.get("otp");
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse("OTP is required"));
        }
        phoneVerificationService.verifyPhone(user.getId(), otp);
        return ResponseEntity.ok(new ApiResponse("Phone number verified successfully"));
    }
}
