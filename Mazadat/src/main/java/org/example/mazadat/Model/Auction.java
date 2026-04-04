package org.example.mazadat.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(columnDefinition = "VARCHAR(200)", nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double startingPrice;

    private Double currentPrice;

    @Column(columnDefinition = "VARCHAR(20)")
    private String status;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "auction_house_id", nullable = false)
    @JsonIgnore
    private AuctionHouse auctionHouse;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    private Set<Image> images;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    private Set<Bid> bids;

    @OneToOne(mappedBy = "auction", cascade = CascadeType.ALL)
    @PrimaryKeyJoinColumn
    private Receipt receipt;
}