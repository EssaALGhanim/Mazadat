package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;

public record AuctionCommentDTOOUT(
        Integer id,
        Integer auctionId,
        String username,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
