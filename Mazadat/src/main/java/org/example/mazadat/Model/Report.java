package org.example.mazadat.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "report",
       uniqueConstraints = @UniqueConstraint(columnNames = {"reporter_id", "auction_id"}))
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Live FK — nullable so the report survives reporter/auction deletion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    // Denormalized snapshot so data is retained even if user is later deleted
    @Column(nullable = false, length = 100)
    private String reporterUsername;

    @Column(nullable = false, length = 255)
    private String reporterEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id")
    private Auction auction;

    @Column(nullable = false, length = 300)
    private String auctionTitle;

    @Column(nullable = false, length = 100)
    private String sellerUsername;

    @Column(length = 255)
    private String sellerEmail;

    @Column(length = 200)
    private String auctionHouseName;

    @Column(columnDefinition = "TEXT")
    private String message;

    // PENDING | REVIEWED | DISMISSED
    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;
}
