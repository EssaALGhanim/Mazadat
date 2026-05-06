package org.example.mazadat.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);
    private static final String BASE_URL = "https://api.authentica.sa/api/v2";

    @Value("${authentica.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // ─── Phone OTP (verification) ─────────────────────────────────────────────

    /**
     * Sends an OTP to the given Saudi phone number via Authentica.sa.
     * Authentica generates and delivers the code — we do not store it.
     */
    public void sendPhoneOtp(String phone) {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("method", "sms");
            body.put("phone", phone);

            HttpEntity<Map<String, String>> req = buildRequest(body);
            ResponseEntity<String> resp = restTemplate.postForEntity(BASE_URL + "/send-otp", req, String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                logger.error("[SMS] send-otp failed for {} — status {}", phone, resp.getStatusCode());
            } else {
                logger.info("[SMS] send-otp sent to {}", phone);
            }
        } catch (Exception e) {
            logger.error("[SMS] send-otp exception for {}: {}", phone, e.getMessage());
        }
    }

    /**
     * Verifies the OTP the user entered against Authentica.
     * Throws RuntimeException if invalid/expired so callers can catch it.
     */
    public void verifyPhoneOtp(String phone, String otp) {
        Map<String, String> body = new HashMap<>();
        body.put("phone", phone);
        body.put("otp", otp);

        try {
            HttpEntity<Map<String, String>> req = buildRequest(body);
            ResponseEntity<String> resp = restTemplate.postForEntity(BASE_URL + "/verify-otp", req, String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                logger.warn("[SMS] verify-otp failed for {} — status {}", phone, resp.getStatusCode());
                throw new RuntimeException("Invalid or expired OTP");
            }
            logger.info("[SMS] Phone verified for {}", phone);
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception e) {
            logger.error("[SMS] verify-otp exception for {}: {}", phone, e.getMessage());
            throw new RuntimeException("Failed to verify OTP: " + e.getMessage());
        }
    }

    // ─── Notification SMS ─────────────────────────────────────────────────────

    /**
     * Sends a free-text notification SMS to a verified phone number.
     * Only call this when the user has phoneVerified = true.
     */
    @Async
    public void sendNotificationSms(String phone, String message) {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("method", "sms");
            body.put("phone", phone);
            body.put("message", message);

            HttpEntity<Map<String, String>> req = buildRequest(body);
            ResponseEntity<String> resp = restTemplate.postForEntity(BASE_URL + "/send-sms", req, String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                logger.warn("[SMS] notify failed for {} — status {}", phone, resp.getStatusCode());
            } else {
                logger.info("[SMS] notification sent to {}", phone);
            }
        } catch (Exception e) {
            logger.error("[SMS] notify exception for {}: {}", phone, e.getMessage());
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private HttpEntity<Map<String, String>> buildRequest(Map<String, String> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");
        headers.set("X-Authorization", apiKey);
        return new HttpEntity<>(body, headers);
    }
}
