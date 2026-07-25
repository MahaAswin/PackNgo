package com.example.PackNgo.config;

import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class RazorpayConfig {

    @Value("${razorpay.key}")
    private String key;

    @Value("${razorpay.secret}")
    private String secret;

    public String getKey() {
        return key;
    }

    public String getSecret() {
        return secret;
    }

    @Bean
    public RazorpayClient razorpayClient() throws Exception {
        System.out.println("------------------------------------");
        System.out.println("Razorpay Configuration");
        System.out.println("------------------------------------");

        boolean envKeyFound = System.getenv("RAZORPAY_KEY") != null && !System.getenv("RAZORPAY_KEY").trim().isEmpty();
        boolean envSecretFound = System.getenv("RAZORPAY_SECRET") != null && !System.getenv("RAZORPAY_SECRET").trim().isEmpty();

        System.out.println("Environment Variable RAZORPAY_KEY : " + (envKeyFound ? "FOUND" : "NOT FOUND"));
        System.out.println("Environment Variable RAZORPAY_SECRET : " + (envSecretFound ? "FOUND" : "NOT FOUND"));

        String trimmedKey = key != null ? key.trim() : "";
        String trimmedSecret = secret != null ? secret.trim() : "";

        boolean propKeyFound = !trimmedKey.isEmpty();
        boolean propSecretFound = !trimmedSecret.isEmpty();

        System.out.println("Property razorpay.key : " + (propKeyFound ? "FOUND" : "NOT FOUND"));
        System.out.println("Property razorpay.secret : " + (propSecretFound ? "FOUND" : "NOT FOUND"));

        if (!trimmedKey.startsWith("rzp_test_")) {
            log.warn("Warning: Razorpay Key does not start with 'rzp_test_'. Ensure you are using Test Mode credentials!");
        }

        System.out.println("Creating RazorpayClient...");
        try {
            RazorpayClient client = new RazorpayClient(trimmedKey, trimmedSecret);
            System.out.println("RazorpayClient initialized successfully.");
            System.out.println("------------------------------------");
            return client;
        } catch (Exception e) {
            System.out.println("RazorpayClient initialization failed: " + e.getMessage());
            System.out.println("------------------------------------");
            throw e;
        }
    }
}
