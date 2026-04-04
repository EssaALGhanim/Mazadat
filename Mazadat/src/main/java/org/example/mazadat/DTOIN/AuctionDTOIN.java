package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AuctionDTOIN {

    @NotEmpty(message = "Title must exist")
    @Size(min = 3, max = 200, message = "Title must be from 3 to 200 chars")
    private String title;

    private String description;

    @NotNull(message = "Starting price must exist")
    @Positive(message = "Starting price must be positive")
    private Double startingPrice;

    @NotNull(message = "Start date must exist")
    private LocalDateTime startDate;

    @NotNull(message = "End date must exist")
    private LocalDateTime endDate;

}