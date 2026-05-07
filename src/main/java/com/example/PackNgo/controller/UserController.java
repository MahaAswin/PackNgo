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
@CrossOrigin(origins = "*")
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<User> updatePackagerStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.findById(id).map(u -> {
            u.setPackagerStatus(body.get("packagerStatus"));
            return ResponseEntity.ok(userService.saveUser(u));
        }).orElse(ResponseEntity.notFound().build());
    }
}
