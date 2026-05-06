package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;
    private final SellerRepository sellerRepository;
    private final EmailService emailService;

    private record OtpEntry(String code, LocalDateTime expiresAt) {}
    private record PendingRegistration(String username, String email, String passwordHash, String phoneNumber, String role) {}

    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, PendingRegistration> pendingRegistrations = new ConcurrentHashMap<>();

    /**
     * Generates and sends an OTP to the email associated with the given identifier.
     * The identifier can be a username or an email address.
     * Returns the masked email address (e.g. u***@example.com).
     */
    public String sendOtp(String identifier) {
        String email = resolveEmail(identifier);
        if (email == null && identifier != null && identifier.contains("@")) {
            String pendingKey = identifier.trim().toLowerCase();
            PendingRegistration pending = pendingRegistrations.get(pendingKey);
            if (pending != null) {
                String code = generateCode();
                otpStore.put(pendingKey, new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
                emailService.sendOtpEmail(pending.email(), pending.username(), code);
                return maskEmail(pending.email());
            }
        }
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

    public String startRegistrationOtp(String username, String email, String rawPassword, String phoneNumber, String role) {
        if (username == null || email == null || rawPassword == null || phoneNumber == null || role == null) {
            throw new ApiException("Missing required registration fields");
        }
        if (userRepository.existsByUsername(username)) throw new ApiException("Username already exists");
        if (userRepository.existsByEmail(email)) throw new ApiException("Email already exists");
        if (userRepository.existsByPhoneNumber(phoneNumber)) throw new ApiException("Phone number already exists");
        if (!"BUYER".equalsIgnoreCase(role) && !"SELLER".equalsIgnoreCase(role)) {
            throw new ApiException("Invalid role");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String code = generateCode();
        String passwordHash = new BCryptPasswordEncoder().encode(rawPassword);

        pendingRegistrations.put(normalizedEmail, new PendingRegistration(
                username.trim(),
                email.trim(),
                passwordHash,
                phoneNumber.trim(),
                role.trim().toUpperCase()
        ));
        otpStore.put(normalizedEmail, new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        emailService.sendOtpEmail(email.trim(), username.trim(), code);
        return maskEmail(email.trim());
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
        // Registration flow: identifier is the email from pending registration.
        if (identifier != null && identifier.contains("@")) {
            String pendingKey = identifier.trim().toLowerCase();
            if (pendingRegistrations.containsKey(pendingKey)) {
                verifyOtpByEmail(pendingKey, code);
                createUserFromPending(pendingKey);
                return true;
            }
        }

        String email = resolveEmail(identifier);
        if (email == null) {
            throw new ApiException("No account found for the given identifier");
        }

        verifyOtpByEmail(email.toLowerCase(), code);
        return true;
    }

    private void verifyOtpByEmail(String emailKey, String code) {
        OtpEntry entry = otpStore.get(emailKey);
        if (entry == null) throw new ApiException("No OTP was sent to this account, or it has already been used");
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(emailKey);
            pendingRegistrations.remove(emailKey);
            throw new ApiException("OTP has expired. Please request a new one");
        }
        if (!entry.code().equals(code.trim())) throw new ApiException("Invalid OTP code");
        otpStore.remove(emailKey);
    }

    @Transactional
    protected void createUserFromPending(String pendingEmailKey) {
        PendingRegistration pending = pendingRegistrations.remove(pendingEmailKey);
        if (pending == null) throw new ApiException("No pending registration found");

        if (userRepository.existsByUsername(pending.username())) throw new ApiException("Username already exists");
        if (userRepository.existsByEmail(pending.email())) throw new ApiException("Email already exists");
        if (userRepository.existsByPhoneNumber(pending.phoneNumber())) throw new ApiException("Phone number already exists");

        User user = new User();
        user.setUsername(pending.username());
        user.setEmail(pending.email());
        user.setPassword(pending.passwordHash());
        user.setPhoneNumber(pending.phoneNumber());
        user.setRole(pending.role());
        userRepository.save(user);

        if ("BUYER".equals(pending.role())) {
            Buyer buyer = new Buyer();
            buyer.setUser(user);
            buyerRepository.save(buyer);
        } else {
            Seller seller = new Seller();
            seller.setUser(user);
            seller.setPayoutVerified(false);
            seller.setRating(0.0);
            seller.setIsAdmin(false);
            sellerRepository.save(seller);
        }
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
