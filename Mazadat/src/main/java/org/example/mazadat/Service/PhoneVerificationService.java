package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PhoneVerificationService {

    private final UserRepository userRepository;
    private final SmsService smsService;

    /**
     * Sends an OTP to the user's phone number via Authentica.sa.
     */
    public void sendVerificationOtp(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        String phone = user.getPhoneNumber();
        if (phone == null || phone.isBlank()) {
            throw new ApiException("No phone number on file. Please add a phone number first.");
        }
        if (Boolean.TRUE.equals(user.isPhoneVerified())) {
            throw new ApiException("Phone number is already verified.");
        }

        smsService.sendPhoneOtp(phone);
    }

    /**
     * Verifies the OTP entered by the user against Authentica.sa.
     * Sets phoneVerified = true on success.
     */
    @Transactional
    public void verifyPhone(Integer userId, String otp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        String phone = user.getPhoneNumber();
        if (phone == null || phone.isBlank()) {
            throw new ApiException("No phone number on file.");
        }
        if (Boolean.TRUE.equals(user.isPhoneVerified())) {
            throw new ApiException("Phone number is already verified.");
        }

        try {
            smsService.verifyPhoneOtp(phone, otp);
        } catch (RuntimeException e) {
            throw new ApiException(e.getMessage());
        }

        user.setPhoneVerified(true);
        userRepository.save(user);
    }
}
