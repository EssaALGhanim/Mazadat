package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;
import java.util.List;

public record AuctionHouseRatingsDTOOUT(
        double averageRating,
        int totalRatings,
        List<RatingEntry> ratings
) {
    public record RatingEntry(
            String buyerUsername,
            int rating,
            String comment,
            LocalDateTime createdAt
    ) {}
}
