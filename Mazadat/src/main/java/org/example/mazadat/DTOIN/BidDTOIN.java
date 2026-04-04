package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BidDTOIN {

    @NotNull(message = "Auction ID must exist")
    private Integer auctionId;

    @NotNull(message = "Amount must exist")
    @Positive(message = "Amount must be positive")
    private Double amount;
}