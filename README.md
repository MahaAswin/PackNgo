# PackNgo - Multi-Vendor Travel Package Booking Platform

PackNgo is a full-stack travel booking application that integrates the Razorpay Payment Gateway.

## Local Development Configuration

To run this application locally, you must configure the following environment variables.

### Backend Environment Variables

Configure these variables on the Spring Boot backend or in your local shell configuration:

```env
RAZORPAY_KEY=rzp_test_xxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxx
```

### Frontend Environment Variables

Create a `.env` file in the `client` directory (or modify the existing one) with the following variable:

```env
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxx
```

## Running the Application

### 1. Run the Backend
From the project root:
```bash
./mvnw.cmd spring-boot:run
```

### 2. Run the Frontend
From the `client` directory:
```bash
npm install
npm run dev
```
