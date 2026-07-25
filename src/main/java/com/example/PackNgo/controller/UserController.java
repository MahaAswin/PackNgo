package com.example.PackNgo.controller;

import com.example.PackNgo.entity.User;
import com.example.PackNgo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered."));
        }
        if (user.getRole() == null) user.setRole(User.Role.USER);
        if (user.getRole() == User.Role.USER) {
            user.setLevel("Bronze Explorer");
            user.setTravelPoints(0);
        }
        if (user.getRole() == User.Role.PACKAGER) {
            user.setPackagerStatus("pending");
        }
        return ResponseEntity.ok(userService.saveUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody User credentials) {
        return userService.findByEmail(credentials.getEmail())
                .filter(u -> u.getPassword().equals(credentials.getPassword()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return userService.findById(id).map(existing -> {
            if (updates.containsKey("companyName") && updates.get("companyName") != null) existing.setCompanyName(updates.get("companyName").toString());
            if (updates.containsKey("ownerName") && updates.get("ownerName") != null) existing.setOwnerName(updates.get("ownerName").toString());
            if (updates.containsKey("phone") && updates.get("phone") != null) existing.setPhone(updates.get("phone").toString());
            if (updates.containsKey("website") && updates.get("website") != null) existing.setWebsite(updates.get("website").toString());
            if (updates.containsKey("companyAddress") && updates.get("companyAddress") != null) existing.setCompanyAddress(updates.get("companyAddress").toString());
            if (updates.containsKey("gstNumber") && updates.get("gstNumber") != null) existing.setGstNumber(updates.get("gstNumber").toString());
            if (updates.containsKey("licenseNumber") && updates.get("licenseNumber") != null) existing.setLicenseNumber(updates.get("licenseNumber").toString());
            if (updates.containsKey("panNumber") && updates.get("panNumber") != null) existing.setPanNumber(updates.get("panNumber").toString());
            if (updates.containsKey("packagerStatus") && updates.get("packagerStatus") != null) existing.setPackagerStatus(updates.get("packagerStatus").toString());
            return ResponseEntity.ok(userService.saveUser(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<User> updatePackagerStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.findById(id).map(u -> {
            u.setPackagerStatus(body.get("packagerStatus"));
            return ResponseEntity.ok(userService.saveUser(u));
        }).orElse(ResponseEntity.notFound().build());
    }
}
