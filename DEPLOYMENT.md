# Digital Wallet - Deployment URLs

## Application URLs

### Frontend
- Production URL: [[https://digital-wallet-frontend-br2s-git-main-devjoshuamainas-projects.vercel.app/](https://digital-wallet-frontend-br2s.vercel.app/)](https://digital-wallet-frontend-br2s.vercel.app/)
- Repository: https://github.com/DevJoshuaMaina/digital-wallet-frontend

### Backend
- API Base URL: https://digital-wallet-springboot-production.up.railway.app/
- Swagger UI: https://digital-wallet-springboot-production.up.railway.app/swagger-ui/index.html#/
- Repository: https://github.com/DevJoshuaMaina/digital-wallet-springboot

### Database
- Host: Railway PostgreSQL
- Connection: [Keep private - don't commit]

## Deployment Platform Details

### Frontend (Vercel)
- Framework: Vue.js 3
- Build Command: `npm run build`
- Output Directory: `dist`
- Auto-Deploy: Enabled on `main` branch

### Backend (Railway)
- Framework: Spring Boot 3.x
- Build Command: `mvn clean package -DskipTests`
- Start Command: `java -jar target/digital-wallet-0.0.1-SNAPSHOT.jar`
- Auto-Deploy: Enabled on `main` branch

### Database (Railway)
- Type: PostgreSQL 15
- Region: us-west
- Backup: Automatic

## Test Accounts

### User 1
- Username: john_martin
- PIN: 4444
- Initial Balance: Ksh. 0

### User 2
- Username: joshua_maina
- PIN: 9173
- Initial Balance: Ksh. 99750

### Test Merchant
- Code: MER51FC404C
- Name: JAVA
- Category: FOOD_AND_BEVERAGE

## Performance Notes
- Average API response time: ~200ms
- Frontend load time: ~1.5s
- Database query time: <100ms

## Deployment Date
- Initial Deployment:  23/02/2026
- Last Updated: 25/02/2026

## Deployed By
Joshua Maina 
