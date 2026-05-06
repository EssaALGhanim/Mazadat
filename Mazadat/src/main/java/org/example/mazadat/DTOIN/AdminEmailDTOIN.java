package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminEmailDTOIN {

    @Size(max = 2000, message = "Custom message must not exceed 2000 characters")
    private String customMessage;
}
