package org.example.mazadat.DTOIN;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuctionCommentDTOIN {

    @NotEmpty(message = "Comment must not be empty")
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String content;
}
