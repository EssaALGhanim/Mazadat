package org.example.mazadat.Model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Seller {

    @Id
    private Integer id;

    @Column(columnDefinition = "VARCHAR(255)")
    private String bankAccount;

    private Boolean payoutVerified;

    private Double rating;

    private Boolean isAdmin;

    @OneToOne
    @MapsId
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "auction_house_id")
    @JsonIgnore
    private AuctionHouse auctionHouse;
}