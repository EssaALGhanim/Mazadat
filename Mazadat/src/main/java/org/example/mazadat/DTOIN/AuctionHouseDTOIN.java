package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuctionHouseDTOIN {

    @Size(min = 3, max = 100)
    private String name;
    @Size(min = 3, max = 255)
    private String location;
    @Size(min = 3, max = 255)
    private String description;
}
