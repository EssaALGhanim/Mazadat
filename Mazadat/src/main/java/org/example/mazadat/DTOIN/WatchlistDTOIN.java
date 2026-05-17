package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WatchlistDTOIN {

    @NotNull(message = "Auction id is required")
    private Integer auctionId;
}
