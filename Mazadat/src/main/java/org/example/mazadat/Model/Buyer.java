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
public class Buyer {

    @Id
    private Integer id;

    @Column(columnDefinition = "VARCHAR(50)")
    private String paymentMethod;

    private Boolean paymentVerified;

    @OneToOne
    @MapsId
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL)
    private Set<Bid> bids;
}