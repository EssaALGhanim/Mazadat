package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SearchPreferenceDTOOUT {

    private Integer id;
    private String name;
    private String keyword;
    private Double minPrice;
    private Double maxPrice;
    private String status;
    private LocalDateTime createdAt;
}
