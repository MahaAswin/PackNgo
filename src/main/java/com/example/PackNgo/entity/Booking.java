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
    @Column(name = "booking_status")
    private BookingStatus bookingStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;
    
    public enum BookingStatus {
        PENDING_PAYMENT, CONFIRMED, CANCELLED
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED
    }
}
