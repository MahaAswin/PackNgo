package com.example.PackNgo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_package_id")
    private TravelPackage travelPackage;
    
    private LocalDate travelDate;
    private Integer guests;
    private BigDecimal totalAmount;
    private String mealPlan;
    private String foodPreference;
    private String hotelType;
    private String transportType;
    private Boolean customPackage;
    
    @Enumerated(EnumType.STRING)
    private BookingStatus status;
    
    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED
    }
}
