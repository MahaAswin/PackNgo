package com.example.PackNgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "itineraries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Itinerary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_package_id")
    private TravelPackage travelPackage;
    
    private Integer dayNumber;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}
