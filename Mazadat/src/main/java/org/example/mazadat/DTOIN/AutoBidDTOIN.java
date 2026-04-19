package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AutoBidDTOIN {

    @NotNull(message = "Auction ID must exist")
    private Integer auctionId;

    @NotNull(message = "Max amount must exist")
    @Positive(message = "Max amount must be positive")
    @Digits(integer = 12, fraction = 0, message = "Max amount must be a whole number")
    private Double maxAmount;
}
