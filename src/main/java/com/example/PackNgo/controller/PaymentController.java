package com.example.PackNgo.controller;

import com.example.PackNgo.dto.OrderRequest;
import com.example.PackNgo.dto.OrderResponse;
import com.example.PackNgo.dto.PaymentVerificationRequest;
import com.example.PackNgo.dto.PaymentVerificationResponse;
import com.example.PackNgo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.example.PackNgo.config.RazorpayConfig razorpayConfig;

    @Autowired(required = false)
    private com.razorpay.RazorpayClient razorpayClient;

    @GetMapping("/debug")
    public ResponseEntity<?> debugRazorpay() {
        String envKey = System.getenv("RAZORPAY_KEY");
        String envSecret = System.getenv("RAZORPAY_SECRET");

        boolean envKeyPresent = envKey != null && !envKey.trim().isEmpty();
        boolean envSecretPresent = envSecret != null && !envSecret.trim().isEmpty();

        boolean propertyKeyLoaded = razorpayConfig.getKey() != null && !razorpayConfig.getKey().trim().isEmpty();
        boolean propertySecretLoaded = razorpayConfig.getSecret() != null && !razorpayConfig.getSecret().trim().isEmpty();

        boolean clientInitialized = razorpayClient != null;

        java.util.Map<String, Boolean> debugInfo = new java.util.HashMap<>();
        debugInfo.put("environmentKeyPresent", envKeyPresent);
        debugInfo.put("environmentSecretPresent", envSecretPresent);
        debugInfo.put("propertyKeyLoaded", propertyKeyLoaded);
        debugInfo.put("propertySecretLoaded", propertySecretLoaded);
        debugInfo.put("clientInitialized", clientInitialized);

        return ResponseEntity.ok(debugInfo);
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            OrderResponse response = paymentService.createOrder(request.getBookingId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (com.razorpay.RazorpayException e) {
            return ResponseEntity.badRequest().body("Razorpay API Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            PaymentVerificationResponse response = paymentService.verifyPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new PaymentVerificationResponse(false, "Verification error: " + e.getMessage()));
        }
    }
}
