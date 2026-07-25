package com.example.PackNgo.controller;

import com.example.PackNgo.entity.TravelPackage;
import com.example.PackNgo.service.TravelPackageService;
import com.example.PackNgo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    @Autowired
    private TravelPackageService packageService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<TravelPackage>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TravelPackage> getPackageById(@PathVariable Long id) {
        return packageService.getPackageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPackage(@RequestBody TravelPackage travelPackage) {
        if (travelPackage.getCreatedById() != null) {
            Optional<com.example.PackNgo.entity.User> packagerOpt = userService.findById(travelPackage.getCreatedById());
            if (packagerOpt.isPresent()) {
                com.example.PackNgo.entity.User packager = packagerOpt.get();
                if (packager.getRole() == com.example.PackNgo.entity.User.Role.PACKAGER) {
                    String status = packager.getPackagerStatus();
                    if (status == null || !status.equalsIgnoreCase("approved")) {
                        return ResponseEntity.status(403).body(Map.of("message", "Your company account has not yet been approved by the administrator."));
                    }
                }
            }
        }
        return ResponseEntity.ok(packageService.savePackage(travelPackage));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return packageService.getPackageById(id)
                .map(existing -> {
                    if (existing.getCreatedById() != null) {
                        Optional<com.example.PackNgo.entity.User> packagerOpt = userService.findById(existing.getCreatedById());
                        if (packagerOpt.isPresent()) {
                            com.example.PackNgo.entity.User packager = packagerOpt.get();
                            if (packager.getRole() == com.example.PackNgo.entity.User.Role.PACKAGER) {
                                String status = packager.getPackagerStatus();
                                if (status == null || !status.equalsIgnoreCase("approved")) {
                                    return ResponseEntity.status(403).body(Map.of("message", "Your company account has not yet been approved by the administrator."));
                                }
                            }
                        }
                    }
                    if (updates.containsKey("status") && updates.get("status") != null) {
                        existing.setStatus(TravelPackage.Status.valueOf(updates.get("status").toString()));
                    }
                    if (updates.containsKey("verified")) {
                        existing.setVerified(Boolean.parseBoolean(updates.get("verified").toString()));
                    }
                    if (updates.containsKey("vendorName")) {
                        existing.setVendorName(updates.get("vendorName").toString());
                    }
                    return ResponseEntity.ok(packageService.savePackage(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        Optional<TravelPackage> pkgOpt = packageService.getPackageById(id);
        if (pkgOpt.isPresent()) {
            TravelPackage existing = pkgOpt.get();
            if (existing.getCreatedById() != null) {
                Optional<com.example.PackNgo.entity.User> packagerOpt = userService.findById(existing.getCreatedById());
                if (packagerOpt.isPresent()) {
                    com.example.PackNgo.entity.User packager = packagerOpt.get();
                    if (packager.getRole() == com.example.PackNgo.entity.User.Role.PACKAGER) {
                        String status = packager.getPackagerStatus();
                        if (status == null || !status.equalsIgnoreCase("approved")) {
                            return ResponseEntity.status(403).body(Map.of("message", "Your company account has not yet been approved by the administrator."));
                        }
                    }
                }
            }
        }
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
