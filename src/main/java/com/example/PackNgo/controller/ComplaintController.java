package com.example.PackNgo.controller;

import com.example.PackNgo.entity.Complaint;
import com.example.PackNgo.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<Complaint> submitComplaint(@RequestBody Complaint complaint) {
        complaint.setStatus(Complaint.ComplaintStatus.OPEN);
        return ResponseEntity.ok(complaintService.saveComplaint(complaint));
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/packager/{packagerId}")
    public ResponseEntity<List<Complaint>> getPackagerComplaints(@PathVariable Long packagerId) {
        return ResponseEntity.ok(complaintService.getComplaintsForPackager(packagerId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Complaint> updateComplaintStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return complaintService.getComplaintById(id)
                .map(c -> {
                    c.setStatus(Complaint.ComplaintStatus.valueOf(body.getOrDefault("status", c.getStatus().name())));
                    return ResponseEntity.ok(complaintService.saveComplaint(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
