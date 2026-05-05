package org.example.mazadat.Util;

import java.time.LocalDateTime;
import java.time.ZoneId;

public final class AppTime {

    public static final ZoneId AUCTION_ZONE = ZoneId.of("Asia/Riyadh");

    private AppTime() {
    }

    public static LocalDateTime now() {
        return LocalDateTime.now(AUCTION_ZONE);
    }
}

