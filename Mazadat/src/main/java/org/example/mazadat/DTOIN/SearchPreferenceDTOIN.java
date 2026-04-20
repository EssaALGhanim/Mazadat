package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchPreferenceDTOIN {

    @NotEmpty(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    private String keyword;

    @Positive(message = "Min price must be positive")
    private Double minPrice;

    @Positive(message = "Max price must be positive")
    private Double maxPrice;

    private String status;
}
