package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class WatchlistDTOOUT {

    private Integer id;
    private Integer auctionId;
    private String auctionTitle;
    private Double currentPrice;
    private String status;
    private LocalDateTime endDate;
    private LocalDateTime addedAt;
}
