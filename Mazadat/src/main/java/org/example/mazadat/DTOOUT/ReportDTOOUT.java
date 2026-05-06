package org.example.mazadat.DTOOUT;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ReportDTOOUT {

    private Integer id;
    private String status;

    // Reporter snapshot
    private String reporterUsername;
    private String reporterEmail;

    // Auction / listing snapshot
    private Integer auctionId;
    private String auctionTitle;
    private String sellerUsername;
    private String sellerEmail;
    private String auctionHouseName;

    // Optional reason
    private String message;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    // true when the auction still exists in the DB (admin can delete it from here)
    private boolean auctionExists;
}
