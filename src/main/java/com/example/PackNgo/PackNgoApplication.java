package com.example.PackNgo;

import com.example.PackNgo.entity.TravelPackage;
import com.example.PackNgo.entity.User;
import com.example.PackNgo.service.TravelPackageService;
import com.example.PackNgo.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.util.Arrays;

@SpringBootApplication
public class PackNgoApplication {

	public static void main(String[] args) {
		SpringApplication.run(PackNgoApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedAdmin(UserService userService) {
		return args -> {
			String adminEmail = "admin@packngo.com";
			if (userService.findByEmail(adminEmail).isEmpty()) {
				User admin = User.builder()
					.name("PackNgo Admin")
					.email(adminEmail)
					.password("admin123")
					.role(User.Role.ADMIN)
					.build();
				userService.saveUser(admin);
			}
		};
	}

	@Bean
	public CommandLineRunner seedDemoData(UserService userService, TravelPackageService packageService) {
		return args -> {
			if (packageService.getAllPackages().isEmpty()) {
				User partnerA = userService.findByEmail("ocean@packngo.com").orElseGet(() -> userService.saveUser(User.builder()
					.name("Ocean Trails Travel")
					.email("ocean@packngo.com")
					.password("partner123")
					.role(User.Role.PACKAGER)
					.companyName("Ocean Trails Travel")
					.ownerName("Nina Sharma")
					.phone("+91 98765 43210")
					.website("https://oceantrails.example.com")
					.companyAddress("17 Marine Drive, Goa")
					.gstNumber("27AABCU9603R1ZV")
					.licenseNumber("TRIP-0042")
					.panNumber("AABPC1234L")
					.packagerStatus("approved")
					.build()));

				User partnerB = userService.findByEmail("mountain@packngo.com").orElseGet(() -> userService.saveUser(User.builder()
					.name("Himalayan Trek Co")
					.email("mountain@packngo.com")
					.password("partner123")
					.role(User.Role.PACKAGER)
					.companyName("Himalayan Trek Co")
					.ownerName("Rohan Singh")
					.phone("+91 99876 54321")
					.website("https://himalayantrek.example.com")
					.companyAddress("101 Alpine Road, Manali")
					.gstNumber("27BCCPK9603N1ZM")
					.licenseNumber("TRIP-0098")
					.panNumber("BBRPS4321N")
					.packagerStatus("pending")
					.build()));

				User partnerC = userService.findByEmail("urban@packngo.com").orElseGet(() -> userService.saveUser(User.builder()
					.name("Urban Escape Journeys")
					.email("urban@packngo.com")
					.password("partner123")
					.role(User.Role.PACKAGER)
					.companyName("Urban Escape Journeys")
					.ownerName("Meera Patel")
					.phone("+91 91234 56789")
					.website("https://urbanescape.example.com")
					.companyAddress("88 City Center, Bangalore")
					.gstNumber("27CCDPM9603F1ZD")
					.licenseNumber("TRIP-0123")
					.panNumber("CCDPK6789M")
					.packagerStatus("approved")
					.build()));

				User partnerD = userService.findByEmail("sunfly@packngo.com").orElseGet(() -> userService.saveUser(User.builder()
					.name("Prakesh Sunfly Adventures")
					.email("sunfly@packngo.com")
					.password("partner123")
					.role(User.Role.PACKAGER)
					.companyName("Prakesh Sunfly Adventures")
					.ownerName("Prakesh Kumar")
					.phone("+91 91111 22334")
					.website("https://sunfly.example.com")
					.companyAddress("25 Freedom Street, Mumbai")
					.gstNumber("27AAZPS9603L1ZT")
					.licenseNumber("TRIP-0210")
					.panNumber("AAZPK1111N")
					.packagerStatus("approved")
					.build()));

				packageService.savePackage(TravelPackage.builder()
					.title("Goa Beachside Escape")
					.location("Goa, India")
					.durationDays(5)
					.durationNights(4)
					.price(BigDecimal.valueOf(12999))
					.rating(4.9)
					.reviewsCount(134)
					.vendorName(partnerA.getCompanyName())
					.verified(true)
					.isTrending(true)
					.createdById(partnerA.getId())
					.status(TravelPackage.Status.ACTIVE)
					.description("Sunset cruises, beach clubs and coastal cuisine with a packaged experience built for easy travel.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
					))
					.build());

				packageService.savePackage(TravelPackage.builder()
					.title("Manali Alpine Retreat")
					.location("Manali, India")
					.durationDays(6)
					.durationNights(5)
					.price(BigDecimal.valueOf(19999))
					.rating(4.7)
					.reviewsCount(89)
					.vendorName(partnerB.getCompanyName())
					.verified(false)
					.isTrending(false)
					.createdById(partnerB.getId())
					.status(TravelPackage.Status.FEATURED)
					.description("A scenic, adventure-filled itinerary with mountain stays, rafting and village culture.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1519817650390-64a93db511aa?auto=format&fit=crop&w=800&q=80"
					))
					.build());

				packageService.savePackage(TravelPackage.builder()
					.title("Bangalore Weekend City Break")
					.location("Bangalore, India")
					.durationDays(3)
					.durationNights(2)
					.price(BigDecimal.valueOf(8999))
					.rating(4.6)
					.reviewsCount(56)
					.vendorName(partnerC.getCompanyName())
					.verified(true)
					.isTrending(true)
					.createdById(partnerC.getId())
					.status(TravelPackage.Status.ACTIVE)
					.description("A stylish city escape with gourmet dining, rooftop lounges, and guided street food tours.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1506967726966-6d0d4dd1d506?auto=format&fit=crop&w=800&q=80"
					))
					.build());

				packageService.savePackage(TravelPackage.builder()
					.title("Goa Sunset Yoga Retreat")
					.location("Goa, India")
					.durationDays(4)
					.durationNights(3)
					.price(BigDecimal.valueOf(14999))
					.rating(4.8)
					.reviewsCount(102)
					.vendorName(partnerA.getCompanyName())
					.verified(true)
					.isTrending(false)
					.createdById(partnerA.getId())
					.status(TravelPackage.Status.ACTIVE)
					.description("Relax on the sands with sunrise yoga, wellness meals and beach meditation sessions.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1496395034556-7e9cfef6c42d?auto=format&fit=crop&w=800&q=80"
					))
					.build());

				packageService.savePackage(TravelPackage.builder()
					.title("Himalayan Winter Wonderland")
					.location("Shimla, India")
					.durationDays(7)
					.durationNights(6)
					.price(BigDecimal.valueOf(23999))
					.rating(4.9)
					.reviewsCount(142)
					.vendorName(partnerB.getCompanyName())
					.verified(true)
					.isTrending(true)
					.createdById(partnerB.getId())
					.status(TravelPackage.Status.ACTIVE)
					.description("Snow treks, warm chalet evenings and panoramic valley views in a premium winter package.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=800&q=80"
					))
					.build());

				packageService.savePackage(TravelPackage.builder()
					.title("Mumbai Sunfly Weekend Escape")
					.location("Mumbai, India")
					.durationDays(3)
					.durationNights(2)
					.price(BigDecimal.valueOf(9999))
					.rating(4.7)
					.reviewsCount(78)
					.vendorName(partnerD.getCompanyName())
					.verified(true)
					.isTrending(true)
					.createdById(partnerD.getId())
					.status(TravelPackage.Status.ACTIVE)
					.description("Premium city stay with skyline dining, harbour cruises, and curated Mumbai experiences.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
					))
					.build());

				packageService.savePackage(TravelPackage.builder()
					.title("Western Ghats Coffee & Waterfalls")
					.location("Lonavala, India")
					.durationDays(4)
					.durationNights(3)
					.price(BigDecimal.valueOf(12999))
					.rating(4.8)
					.reviewsCount(96)
					.vendorName(partnerD.getCompanyName())
					.verified(false)
					.isTrending(false)
					.createdById(partnerD.getId())
					.status(TravelPackage.Status.ACTIVE)
					.description("Refresh with lush hill stays, coffee estates, and waterfall treks near Mumbai.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
					))
					.build());

				packageService.savePackage(TravelPackage.builder()
					.title("Bangalore Cultural Weekend")
					.location("Bangalore, India")
					.durationDays(2)
					.durationNights(1)
					.price(BigDecimal.valueOf(6999))
					.rating(4.5)
					.reviewsCount(34)
					.vendorName(partnerC.getCompanyName())
					.verified(false)
					.isTrending(false)
					.createdById(partnerC.getId())
					.status(TravelPackage.Status.DRAFT)
					.description("Discover Bangalore's art districts, markets, and heritage with an expert city guide.")
					.images(Arrays.asList(
						"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
						"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
					))
					.build());
			}
		};
	}
}
