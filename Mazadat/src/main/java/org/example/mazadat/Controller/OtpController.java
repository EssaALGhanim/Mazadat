package org.example.mazadat.Controller;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.Service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    /**
     * Sends an OTP to the email of the account identified by identifier (username or email).
     * Body: { "identifier": "username_or_email" }
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String maskedEmail = otpService.sendOtp(identifier);
        return ResponseEntity.ok(new ApiResponse("OTP sent", Map.of("maskedEmail", maskedEmail)));
    }

    /**
     * Starts registration by sending OTP without creating the user yet.
     * Body: { "username", "email", "password", "phoneNumber", "role" }
     */
    @PostMapping("/register/start")
    public ResponseEntity<?> startRegistration(@RequestBody Map<String, String> body) {
        String maskedEmail = otpService.startRegistrationOtp(
                body.get("username"),
                body.get("email"),
                body.get("password"),
                body.get("phoneNumber"),
                body.get("role")
        );
        return ResponseEntity.ok(new ApiResponse("Registration OTP sent", Map.of("maskedEmail", maskedEmail)));
    }

    /**
     * Verifies the OTP.
     * Body: { "identifier": "username_or_email", "code": "123456" }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String code = body.get("code");
        otpService.verifyOtp(identifier, code);
        return ResponseEntity.ok(new ApiResponse("OTP verified successfully"));
    }
}
