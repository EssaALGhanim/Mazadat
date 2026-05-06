package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final EmailService emailService;

    private record OtpEntry(String code, LocalDateTime expiresAt) {}

    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    /**
     * Generates and sends an OTP to the email associated with the given identifier.
     * The identifier can be a username or an email address.
     * Returns the masked email address (e.g. u***@example.com).
     */
    public String sendOtp(String identifier) {
        String email = resolveEmail(identifier);
        if (email == null) {
            throw new ApiException("No account found for the given identifier");
        }

        User user = userRepository.findUserByEmail(email);
        String username = user != null ? user.getUsername() : "User";

        String code = generateCode();
        otpStore.put(email.toLowerCase(), new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        emailService.sendOtpEmail(email, username, code);

        return maskEmail(email);
    }

    /**
     * Called internally during registration so the OTP is sent using the new user's data.
     */
    public void sendOtpToNewUser(String email, String username) {
        String code = generateCode();
        otpStore.put(email.toLowerCase(), new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        emailService.sendOtpEmail(email, username, code);
    }

    /**
     * Verifies the OTP for the given identifier.
     * Returns true if valid; throws ApiException if expired or wrong.
     */
    public boolean verifyOtp(String identifier, String code) {
        String email = resolveEmail(identifier);
        if (email == null) {
            throw new ApiException("No account found for the given identifier");
        }

        OtpEntry entry = otpStore.get(email.toLowerCase());
        if (entry == null) {
            throw new ApiException("No OTP was sent to this account, or it has already been used");
        }
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email.toLowerCase());
            throw new ApiException("OTP has expired. Please request a new one");
        }
        if (!entry.code().equals(code.trim())) {
            throw new ApiException("Invalid OTP code");
        }

        otpStore.remove(email.toLowerCase());
        return true;
    }

    private String resolveEmail(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return null;
        }
        if (identifier.contains("@")) {
            User user = userRepository.findUserByEmail(identifier.trim());
            return user != null ? user.getEmail() : null;
        }
        User user = userRepository.findUserByUsername(identifier.trim());
        return user != null ? user.getEmail() : null;
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        int number = random.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", number);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) return email;
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
