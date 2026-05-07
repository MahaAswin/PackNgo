package com.example.PackNgo.service;

import com.example.PackNgo.entity.Feedback;
import com.example.PackNgo.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;

    public Feedback saveFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getFeedbackForPackager(Long packagerId) {
        return feedbackRepository.findByPackagerIdOrderByCreatedAtDesc(packagerId);
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }
}
