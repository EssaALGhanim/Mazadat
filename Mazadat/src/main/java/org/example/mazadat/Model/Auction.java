package org.example.mazadat.Model;

import java.time.LocalDateTime;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    @JsonIgnore
    private Double reservePrice;

    private Double currentPrice;

    @Column(columnDefinition = "VARCHAR(20)")
    private String status;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Column(columnDefinition = "VARCHAR(255)")
    private String highestBidder;

    @Column(columnDefinition = "VARCHAR(255)")
    private String highestBidderEmail;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "auction_house_id", nullable = false)
    @JsonIgnore
    private AuctionHouse auctionHouse;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnore
    private Seller seller;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Image> images;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL)
    private Set<Bid> bids;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<AutoBid> autoBids;

    @JsonProperty("sellerName")
    public String getSellerName() {
        if (seller == null || seller.getUser() == null) {
            return null;
        }
        return seller.getUser().getUsername();
    }

    @JsonProperty("auctionHouseName")
    public String getAuctionHouseName() {
        if (auctionHouse == null) {
            return null;
        }
        return auctionHouse.getName();
    }

    @JsonProperty("auctionHouseId")
    public Integer getAuctionHouseId() {
        return auctionHouse == null ? null : auctionHouse.getId();
    }

    @JsonProperty("bidCount")
    public Integer getBidCount() {
        return bids == null ? 0 : bids.size();
    }

}