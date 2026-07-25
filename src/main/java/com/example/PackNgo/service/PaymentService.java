package com.example.PackNgo.service;

import com.example.PackNgo.dto.OrderResponse;
import com.example.PackNgo.dto.PaymentVerificationRequest;
import com.example.PackNgo.dto.PaymentVerificationResponse;
import com.example.PackNgo.entity.Booking;
import com.example.PackNgo.entity.Payment;
import com.example.PackNgo.repository.BookingRepository;
import com.example.PackNgo.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentService {

    @Autowired
    private com.example.PackNgo.config.RazorpayConfig razorpayConfig;

    @Autowired(required = false)
    private RazorpayClient razorpayClient;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostConstruct
    public void init() {
        log.info("Checking Razorpay Client status...");
        if (this.razorpayClient == null) {
            log.warn("Razorpay Client bean is null. Please verify environment credentials.");
        } else {
            log.info("Razorpay Client successfully autowired.");
        }
    }

    @Transactional
    public OrderResponse createOrder(Long bookingId) throws Exception {
        log.info("Starting order creation for Booking ID: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (this.razorpayClient == null) {
            log.error("Razorpay Client is not initialized! Check credentials.");
            throw new IllegalStateException("Razorpay Client is not initialized. Please verify configuration keys.");
        }

        // Razorpay expects amount in paise (1 INR = 100 paise)
        BigDecimal amount = booking.getTotalAmount();
        long amountInPaise = amount.multiply(new BigDecimal("100")).longValue();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt_booking_" + bookingId);

        log.info("Sending request to Razorpay Order API: Amount: {} paise, Currency: INR, Receipt: {}", amountInPaise, "receipt_booking_" + bookingId);

        com.razorpay.Order razorpayOrder;
        try {
            razorpayOrder = razorpayClient.orders.create(orderRequest);
        } catch (com.razorpay.RazorpayException e) {
            log.error("Razorpay Exception during order creation: Message: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected exception during order creation: {}", e.getMessage(), e);
            throw e;
        }

        String razorpayOrderId = razorpayOrder.get("id");
        log.info("Razorpay Order created successfully. Order ID: {}", razorpayOrderId);

        Payment payment = Payment.builder()
                .bookingId(bookingId)
                .razorpayOrderId(razorpayOrderId)
                .amount(amount)
                .currency("INR")
                .status(Payment.PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        String trimmedKey = razorpayConfig.getKey() != null ? razorpayConfig.getKey().trim() : "";
        return new OrderResponse(razorpayOrderId, amount, "INR", trimmedKey);
    }

    @Transactional
    public PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request) {
        String secret = razorpayConfig.getSecret() != null ? razorpayConfig.getSecret().trim() : "";
        
        boolean signatureReceived = request.getRazorpaySignature() != null && !request.getRazorpaySignature().isEmpty();
        boolean isValid = false;
        String errorMessage = "";

        if (signatureReceived) {
            try {
                org.json.JSONObject options = new org.json.JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());

                isValid = com.razorpay.Utils.verifyPaymentSignature(options, secret);
            } catch (Exception e) {
                isValid = false;
                errorMessage = e.getMessage();
            }
        } else {
            errorMessage = "Signature is missing in verification request.";
        }

        Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId());
        boolean bookingUpdated = false;

        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());

            Booking booking = bookingRepository.findById(payment.getBookingId()).orElse(null);

            if (isValid) {
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                paymentRepository.save(payment);

                if (booking != null) {
                    booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);
                    booking.setPaymentStatus(Booking.PaymentStatus.SUCCESS);
                    bookingRepository.save(booking);
                    bookingUpdated = true;
                }
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);

                if (booking != null) {
                    booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
                    bookingRepository.save(booking);
                }
            }
        }

        // Print exact logging format requested
        System.out.println("==========================");
        System.out.println("Payment Verification");
        System.out.println("==========================");
        System.out.println("Order ID: " + request.getRazorpayOrderId());
        System.out.println("Payment ID: " + request.getRazorpayPaymentId());
        System.out.println("Signature Received: " + (signatureReceived ? "YES" : "NO"));
        System.out.println("Signature Valid: " + (isValid ? "YES" : "NO"));
        System.out.println("Booking Updated: " + (bookingUpdated ? "YES" : "NO"));
        System.out.println("==========================");

        if (paymentOpt.isEmpty()) {
            return new PaymentVerificationResponse(false, "Payment record not found for Razorpay Order ID: " + request.getRazorpayOrderId());
        }

        if (isValid) {
            return new PaymentVerificationResponse(true, "Payment verified successfully");
        } else {
            String detailedReason = "Signature mismatch. " + (errorMessage == null || errorMessage.isEmpty() ? "The calculated signature does not match the received signature. Ensure that the correct Razorpay Key Secret is configured." : errorMessage);
            return new PaymentVerificationResponse(false, detailedReason);
        }
    }

    private String calculateHmacSha256(String data, String secret) {
        try {
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : rawHmac) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
