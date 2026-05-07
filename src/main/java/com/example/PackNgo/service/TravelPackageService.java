package com.example.PackNgo.service;

import com.example.PackNgo.entity.TravelPackage;
import com.example.PackNgo.repository.TravelPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TravelPackageService {
    @Autowired
    private TravelPackageRepository travelPackageRepository;

    public List<TravelPackage> getAllPackages() {
        return travelPackageRepository.findAll();
    }

    public Optional<TravelPackage> getPackageById(Long id) {
        return travelPackageRepository.findById(id);
    }

    public TravelPackage savePackage(TravelPackage travelPackage) {
        return travelPackageRepository.save(travelPackage);
    }

    public void deletePackage(Long id) {
        travelPackageRepository.deleteById(id);
    }
}
