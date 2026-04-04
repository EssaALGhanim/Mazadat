package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageDTOOUT {

    private Integer id;
    private String url;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}