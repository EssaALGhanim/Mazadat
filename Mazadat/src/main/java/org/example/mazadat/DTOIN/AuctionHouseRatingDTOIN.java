package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AuctionHouseRatingDTOIN {

    @NotNull(message = "Auction ID is required")
    private Integer auctionId;

    @NotNull(message = "Auction house ID is required")
    private Integer auctionHouseId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Size(max = 300, message = "Comment must not exceed 300 characters")
    private String comment;
}
