# KHAO Backend Setup & Architecture Guide

## Overview

KHAO Backend is built with **NestJS** + **TypeScript** with a microservices-ready architecture. It follows a modular, scalable approach with PostgreSQL + MongoDB hybrid database system.

## Quick Start

### Prerequisites
- Node.js v20+
- Docker & Docker Compose
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/foodluck/service-backend.git
cd service-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your local/development values

# 4. Start Docker services (PostgreSQL, MongoDB, Redis)
docker-compose up -d

# 5. Run the application
npm run start:dev
```

### Verification

Once started, verify the setup:
- API Health: `http://localhost:3000/api/docs` (Swagger UI)
- Send OTP Test: `POST http://localhost:3000/auth/send-otp`

---

## Project Structure

```
service-backend/
├── src/
│   ├── modules/                    # Feature modules
│   │   ├── auth/                   # Authentication (OTP, JWT)
│   │   ├── users/                  # User management
│   │   ├── addresses/              # Address management
│   │   ├── restaurants/            # Restaurant panel
│   │   ├── menu/                   # Menu management
│   │   ├── cart/                   # Shopping cart (MongoDB)
│   │   ├── orders/                 # Order processing
│   │   ├── pins/                   # PIN management system
│   │   ├── delivery-agents/        # Delivery agent module
│   │   ├── tracking/               # Real-time tracking (Socket.io)
│   │   ├── payments/               # Payment processing
│   │   ├── wallet/                 # Wallet system
│   │   ├── payouts/                # Payout management
│   │   ├── promotions/             # Promos & referrals
│   │   ├── support/                # Support tickets
│   │   ├── refunds/                # Refund processing
│   │   ├── communications/         # Messaging & notifications
│   │   ├── ai-meals/               # AI recommendations
│   │   └── analytics/              # Analytics & reporting
│   │
│   ├── common/                     # Shared utilities
│   │   ├── decorators/             # Custom decorators (@CurrentUser, @Roles)
│   │   ├── enums/                  # Enums (UserRole, UserStatus, OrderStatus)
│   │   ├── filters/                # Exception filters
│   │   ├── guards/                 # Auth guards (JWT, Roles)
│   │   ├── pipes/                  # Validation pipes
│   │   └── utils/                  # Helper functions
│   │
│   ├── config/                     # Configuration files
│   │   ├── app.config.ts           # App settings
│   │   ├── database.config.ts      # DB connections
│   │   └── jwt.config.ts           # JWT settings
│   │
│   ├── database/
│   │   ├── entities/               # TypeORM entities
│   │   ├── migrations/             # Database migrations
│   │   └── subscribers/            # Entity subscribers
│   │
│   ├── app.module.ts               # Root module
│   └── main.ts                     # Entry point
│
├── test/                           # Test files
├── docker-compose.yml              # Docker services
├── Dockerfile                      # Container image
├── .env.example                    # Environment template
└── package.json                    # Dependencies
```

---

## Technology Stack

### Core
- **NestJS** 10.x - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Express.js** - HTTP server (via NestJS)

### Databases
- **PostgreSQL** - Relational data (users, orders, restaurants, payments)
- **MongoDB** - Document data (carts, tracking, chat, logs)
- **Redis** - Caching, sessions, queues

### Authentication & Security
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing (if needed)

### APIs & External Services
- **Twilio** - OTP delivery
- **Firebase Admin SDK** - Push notifications
- **Stripe & Omise** - Payment processing
- **Google Maps API** - Geolocation & routing
- **OpenAI API** - AI meal recommendations
- **AWS S3** - File storage
- **WhatsApp Cloud API** - WhatsApp notifications

### Tools & Libraries
- **Swagger/OpenAPI** - API documentation
- **Bull** - Job queue (Redis-based)
- **Socket.io** - Real-time features
- **Class Validator** - Input validation
- **Winston** - Logging

---

## Database Schema (Phase 1 Complete)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  country_code VARCHAR(3),
  phone_number VARCHAR(20),
  role ENUM('customer', 'restaurant', 'delivery_agent', 'admin', 'support_agent'),
  status ENUM('active', 'inactive', 'banned', 'pending_approval'),
  phone_verified BOOLEAN DEFAULT false,
  email VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(country_code, phone_number)
);
```

### UserProfile Table
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY,
  name VARCHAR(255),
  gender VARCHAR(50),
  dob DATE,
  email VARCHAR(255),
  profile_photo TEXT,
  language VARCHAR(10) DEFAULT 'en',
  identification_pin CHAR(4) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### UserAddresses Table
```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY,
  user_id UUID,
  label VARCHAR(100),
  receiver_name VARCHAR(255),
  receiver_contact VARCHAR(20),
  full_address TEXT,
  floor VARCHAR(100),
  landmark VARCHAR(255),
  locality VARCHAR(100),
  country VARCHAR(3),
  state VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## API Endpoints (Phase 1)

### Authentication
```
POST   /auth/send-otp              - Send OTP to phone
POST   /auth/verify-otp            - Verify OTP & get tokens
POST   /auth/refresh-token         - Refresh access token
GET    /auth/me                    - Get current user (JWT protected)
POST   /auth/logout                - Logout user
```

### Users
```
GET    /users/me                   - Get profile (JWT)
PUT    /users/me                   - Update profile (JWT)
GET    /users/:id                  - Get user by ID (JWT)
GET    /users                      - List all users (Admin/Support)
PUT    /users/:id/status           - Update user status (Admin)
PUT    /users/:id/reset            - Reset user account (Admin/Support)
```

### Addresses
```
GET    /addresses                  - Get user addresses (JWT)
POST   /addresses                  - Create address (JWT)
GET    /addresses/:id              - Get address by ID (JWT)
PUT    /addresses/:id              - Update address (JWT)
DELETE /addresses/:id              - Delete address (JWT)
```

### Documentation
```
GET    /api/docs                   - Swagger UI
GET    /api-json                   - OpenAPI JSON
```

---

## Environment Variables

Key variables needed in `.env`:

```bash
# App
NODE_ENV=development
APP_PORT=3000

# Database
DATABASE_HOST=postgres
DATABASE_USER=khao_user
DATABASE_PASSWORD=khao_pass_secure
DATABASE_NAME=khao_db

# MongoDB
MONGODB_URI=mongodb://mongo:27017/khao_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=3600

# OTP Service
OTP_SERVICE=twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token

# AWS & Third-party APIs
AWS_ACCESS_KEY_ID=your-key
AWS_S3_BUCKET=khao-bucket
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_MAPS_API_KEY=your-key
OPENAI_API_KEY=your-key
```

See `.env.example` for complete list.

---

## Git Workflow

This project uses **phase-based branches** for organized development:

### Branch Naming Convention
```
phase_1_foundation           - Auth, Users, Addresses (COMPLETE)
phase_2_restaurant_menu      - Restaurants, Menu, Favorites
phase_3_cart_orders          - Cart, Orders, Pins
phase_4_delivery_tracking    - Agents, Tracking, Geolocation
phase_5_payments_wallet      - Payments, Wallet, Payouts
phase_6_support_promotions   - Support, Refunds, Promos
phase_7_communications_ai    - Messaging, AI Meals, Analytics
phase_8_testing_deploy       - Tests, Optimization, DevOps
```

### Commit Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore
Scopes: auth, users, addresses, orders, payments, etc.

Example:
```
feat(auth): Add OTP verification

- Implement OTP send/verify endpoints
- Add JWT token generation
- Create auth service and controller

Closes #123
```

---

## Development Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Services
```bash
docker-compose up -d
```

### 3. Run Development Server
```bash
npm run start:dev
```

### 4. View Logs
```bash
npm run start:debug
```

### 5. Build for Production
```bash
npm run build
```

### 6. Run Tests
```bash
npm run test              # Unit tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # E2E tests
```

---

## Testing Database

### Reset Database
```bash
# Remove Docker volumes (careful!)
docker-compose down -v
docker-compose up -d

# Wait for postgres to be ready, then:
npm run migration:run
```

### Access PostgreSQL
```bash
docker exec -it khao_postgres psql -U khao_user -d khao_db
```

### Access MongoDB
```bash
docker exec -it khao_mongo mongosh -u khao_user -p khao_pass_secure
```

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Docker Compose Issues
```bash
# Restart all services
docker-compose down
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Database Connection Error
```bash
# Check if containers are running
docker-compose ps

# Check network connectivity
docker exec khao_api ping postgres
```

---

## Performance Optimization

### Caching Strategy
- Use Redis for session storage
- Cache frequently accessed data (restaurants, menus)
- Implement rate limiting on public endpoints

### Database Optimization
- Add indexes on frequently queried fields
- Use pagination for list endpoints
- Denormalize where appropriate (e.g., cache menu counts)

### API Optimization
- Use response DTOs to control payload size
- Implement field selection on list endpoints
- Use eager loading for related data

---

## Security Checklist

- [ ] Change default JWT_SECRET in production
- [ ] Enable HTTPS/TLS
- [ ] Setup rate limiting
- [ ] Implement CORS properly
- [ ] Use environment variables for all secrets
- [ ] Setup database encryption
- [ ] Enable audit logging
- [ ] Setup monitoring & alerting

---

## Monitoring & Logging

### Winston Logger
Configured for development and production with:
- File logging
- Console output
- Error tracking
- Performance metrics

### API Monitoring
- Request/response logging via Morgan
- Error tracking via Sentry (optional)
- Performance metrics via New Relic (optional)

---

## Deployment

### Docker Build
```bash
docker build -t khao-api:1.0.0 .
```

### AWS Deployment
- Push image to ECR
- Deploy to ECS/Fargate
- Configure RDS for PostgreSQL
- Use DocumentDB for MongoDB
- Use ElastiCache for Redis

### Environment Variables (Production)
Update in AWS Secrets Manager or Parameter Store

---

## Contributing

1. Create feature branch from appropriate phase branch
2. Make changes and commit with proper format
3. Push to remote
4. Create Pull Request
5. Get code review
6. Merge to phase branch

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
- [Swagger/OpenAPI](https://swagger.io)
- [Passport.js](https://www.passportjs.org)
- [PostgreSQL](https://www.postgresql.org/docs)
- [MongoDB Manual](https://docs.mongodb.com/manual)

---

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Contact development team

---

**Last Updated**: November 2024
**Status**: Phase 1 Foundation Complete ✅
**Next Phase**: Phase 2 - Restaurant & Menu Management
