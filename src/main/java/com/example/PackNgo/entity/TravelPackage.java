package com.example.PackNgo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "travel_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String location;
    
    private Integer durationDays;
    private Integer durationNights;
    
    private BigDecimal price;
    
    private Double rating;
    private Integer reviewsCount;
    private String vendorName;
    private Boolean verified;
    
    private Boolean isTrending;

    private Long createdById;

    @Enumerated(EnumType.STRING)
    private Status status;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    private List<String> mealOptions;

    @ElementCollection
    private List<String> foodPreferences;

    private String restaurantDetails;

    @ElementCollection
    private List<String> hotelTypes;

    @ElementCollection
    private List<String> transportTypes;

    private Boolean customizablePackage;
    
    @ElementCollection
    private List<String> images;
    
    public enum Status {
        ACTIVE, FEATURED, DRAFT
    }
}
