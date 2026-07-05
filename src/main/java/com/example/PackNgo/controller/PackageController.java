package com.example.PackNgo.controller;

import com.example.PackNgo.entity.TravelPackage;
import com.example.PackNgo.service.TravelPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    @Autowired
    private TravelPackageService packageService;

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
    public ResponseEntity<TravelPackage> createPackage(@RequestBody TravelPackage travelPackage) {
        return ResponseEntity.ok(packageService.savePackage(travelPackage));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TravelPackage> updatePackage(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return packageService.getPackageById(id)
                .map(existing -> {
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
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
