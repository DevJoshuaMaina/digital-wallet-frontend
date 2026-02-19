# Digital Wallet System
A modern, responsive web application for managing digital wallets, built with a Spring Boot REST API backend and a Vue.js 3 frontend. Users can register, log in securely with JWT authentication, manage wallets, perform P2P transfers, pay merchants, and track transactions.

## Tech Stack
### Backend
- Java: 17+
- Spring Boot: 3.x (with Spring Security for JWT auth)
- Database: H2 (in-memory for development; switch to PostgreSQL/MySQL for production)
- Security: JWT tokens, BCrypt password hashing
- Build Tool: Maven
- Other: Lombok, JJWT

### Frontend
- Vue.js: 3 (Composition API)
- Vue Router: For client-side routing
- Pinia: State management
- Axios: HTTP client for API calls
- Tailwind CSS: Utility-first CSS framework
- Build Tool: Vite

## Features
- User Authentication: Secure registration and login with JWT tokens (PIN-based, hashed with BCrypt).
- Wallet Management: View balance, add money, set daily limits.
- Money Transfers: P2P transfers with recipient search and PIN confirmation.
- Merchant Payments: Browse and pay merchants by category.
- Transaction History: Paginated list with filters (type, status, date).
- Responsive Design: Mobile-first UI with Tailwind CSS.
- Error Handling: User-friendly messages and loading states.
- Security: Stateless JWT auth, protected routes, input validation.

## Prerequisites
- Java: 17+ (for backend)
- Node.js: 18+ and npm 9+ (for frontend)
- Maven: 3.6+ (for backend builds)
- Git: For version control
- Postman or similar: For API testing

## Installation and Setup
### Backend Setup (Spring Boot)
#### Clone the Repository:
git clone <your-repo-url>
cd digital-wallet-backend  # Assuming backend is in a subfolder

#### Install Dependencies:
Ensure Maven is installed. Run:
mvn clean install

#### Configure Environment:
Create src/main/resources/application.properties (if not present):
- Database (H2 for dev; change for prod)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true  # Access H2 console at /h2-console
- JWT Secret (change to a strong key in production)
jwt.secret=your-secret-key-here
- Logging
logging.level.org.springframework.security=DEBUG

Add dependencies to pom.xml (as discussed: spring-boot-starter-security, jjwt, etc.).

#### Run the Application:
mvn spring-boot:run

Backend will start on http://localhost:8080.
Access H2 console at http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:testdb).

## Frontend Setup (Vue.js)
### Navigate to Frontend Directory:
cd ../digital-wallet-frontend  # Assuming frontend is in a sibling folder

### Install Dependencies:
npm install

### Configure Environment:
Create .env file in the root:
VITE_API_BASE_URL=http://localhost:8080/api/v1

### Run the Development Server:
npm run dev
Frontend will start on http://localhost:5173.
Open in browser and test with the backend running.

### API Documentation
The backend exposes RESTful endpoints under /api/v1. 
All protected endpoints require Authorization: Bearer <jwt-token> header.

### Authentication Endpoints
- POST /api/v1/users/register: Register a new user.
- Body: { "username": "string", "pin": "string", "fullName": "string", "email": "string", "phoneNumber": "string" }
- Response: User object (201 Created).
- POST /api/v1/users/login: Authenticate user and return JWT.
- Body: { "username": "string", "pin": "string" }
- Response: { "token": "string", "user": {...} } (200 OK).

### Wallet Endpoints
- GET /api/v1/wallets/user/{userId}: Get user's wallet.
- POST /api/v1/wallets/{walletId}/add-money: Add money to wallet.
- Body: { "amount": number, "paymentMethod": "string", "description": "string" }

### Transaction Endpoints
- POST /api/v1/transactions/transfer: Perform P2P transfer.
- Body: { "senderId": number, "recipientId": number, "amount": number, "description": "string", "pin": "string" }
- POST /api/v1/transactions/merchant-payment: Pay a merchant.
- GET /api/v1/transactions/user/{userId}: Get user's transactions (paginated).
- GET /api/v1/transactions/user/{userId}/stats: Get transaction stats.

### Merchant Endpoints
- GET /api/v1/merchants: Get all merchants.
- GET /api/v1/merchants/category/{category}: Get merchants by category.

### User Endpoints
- GET /api/v1/users/{id}: Get user by ID.
- PUT /api/v1/users/{id}: Update user profile.
- Use Postman to test. For full Swagger docs, add springdoc-openapi to pom.xml and access /swagger-ui.html.

## Usage
- Register/Login: Use the frontend or Postman to create an account and log in.
- Dashboard: View wallet balance, recent transactions, and quick actions.
- Transfer Money: Search for a recipient, enter amount/PIN, and confirm.
- Pay Merchants: Browse categories, select a merchant, and pay.
- View History: Filter and paginate transactions.
- Profile: Update details or logout.


## Author
Joshua Maina Njomo - dev.joshuamaina@gmail.com

