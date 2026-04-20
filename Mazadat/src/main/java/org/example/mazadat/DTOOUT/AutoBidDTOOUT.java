package org.example.mazadat.DTOOUT;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AutoBidDTOOUT {

    private Integer id;
    private Integer auctionId;
    private String auctionTitle;
    private Double maxAmount;
    private Boolean active;
    private LocalDateTime createdAt;
}
