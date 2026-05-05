package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;

public record NotificationDTOOUT(
        Integer id,
        String message,
        String messageAr,
        String type,
        String link,
        boolean read,
        LocalDateTime createdAt
) {}
