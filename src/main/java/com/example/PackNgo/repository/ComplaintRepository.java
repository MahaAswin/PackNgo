package com.example.PackNgo.repository;

import com.example.PackNgo.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByPackagerIdOrderByCreatedAtDesc(Long packagerId);
}
