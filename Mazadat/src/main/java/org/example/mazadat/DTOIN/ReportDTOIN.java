package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportDTOIN {

    @NotNull(message = "Auction ID is required")
    private Integer auctionId;

    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;
}
