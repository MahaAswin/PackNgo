package com.example.PackNgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String level;
    private Integer travelPoints;

    // Packager fields
    private String companyName;
    private String ownerName;
    private String phone;
    private String website;
    private String companyAddress;
    private String gstNumber;
    private String licenseNumber;
    private String panNumber;
    private String packagerStatus; // pending, approved, rejected

    public enum Role {
        USER, ADMIN, PACKAGER
    }
}
