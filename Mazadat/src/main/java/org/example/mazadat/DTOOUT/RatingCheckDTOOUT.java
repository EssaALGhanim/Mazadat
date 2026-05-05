package org.example.mazadat.DTOOUT;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RatingCheckDTOOUT {

    private Boolean rated;
    private Integer rating;
    private String comment;
}
