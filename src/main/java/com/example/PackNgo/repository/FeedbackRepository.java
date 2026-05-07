package com.example.PackNgo.repository;

import com.example.PackNgo.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByPackagerIdOrderByCreatedAtDesc(Long packagerId);
}
