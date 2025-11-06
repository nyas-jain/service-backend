# KHAO Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Start Docker Services
```bash
cd service-backend
docker-compose up -d
```

### 2. Install & Run
```bash
npm install
npm run start:dev
```

### 3. Verify Setup
```bash
# Open in browser:
http://localhost:3000/api/docs
```

---

## 🧪 Test the API

### 1. Send OTP
```bash
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"country_code":"TH","phone_number":"9876543210"}'
```

Response:
```json
{
  "message": "OTP sent successfully to TH9876543210"
}
```

### 2. Verify OTP (Use OTP: `1234`)
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"country_code":"TH","phone_number":"9876543210","otp":"1234"}'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user_id": "uuid-here",
  "role": "customer",
  "phone_number": "9876543210"
}
```

### 3. Get User Profile (Use access_token from above)
```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer <access_token>"
```

### 4. Update Profile
```bash
curl -X PUT http://localhost:3000/users/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### 5. Create Address
```bash
curl -X POST http://localhost:3000/addresses \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_address":"123 Main St",
    "country":"TH",
    "latitude":13.7563,
    "longitude":100.5018,
    "label":"home"
  }'
```

---

## 📂 Project Structure

```
src/
├── modules/
│   ├── auth/          ✅ Authentication
│   ├── users/         ✅ User Management
│   ├── addresses/     ✅ Address Management
│   └── ...
├── common/            ✅ Shared utilities
├── config/            ✅ Configuration
└── database/          ✅ Entities & Schema
```

---

## 🔧 Useful Commands

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start in debug mode

# Build & Run
npm run build            # Build for production
npm start                # Run production build

# Testing
npm test                 # Run unit tests
npm run test:watch      # Watch mode
npm run test:e2e        # E2E tests

# Database
docker exec -it khao_postgres psql -U khao_user -d khao_db
docker exec -it khao_mongo mongosh

# Clean
docker-compose down -v   # Remove all containers & volumes
```

---

## 📚 Documentation

- **Full Setup Guide**: [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **API Docs**: http://localhost:3000/api/docs (Swagger UI)

---

## 🐛 Troubleshooting

### Port 3000 in use?
```bash
lsof -i :3000
kill -9 <PID>
```

### Docker not starting?
```bash
docker-compose down
docker-compose up -d
```

### Database connection error?
```bash
# Check containers are running
docker-compose ps

# Check logs
docker-compose logs postgres
```

---

## 📋 Phase 1 Status: ✅ COMPLETE

**What's Built:**
- ✅ Authentication (OTP + JWT)
- ✅ User Management
- ✅ Address Management
- ✅ API Documentation
- ✅ Docker Setup

**Next Phase:**
- 🔄 Restaurant Management
- 🔄 Menu Management
- 🔄 Favorites

---

## 🚀 Ready to Code?

```bash
# Create feature branch from phase_1_foundation
git checkout -b phase_2_restaurants

# Make changes...
git add .
git commit -m "feat(restaurants): your feature"

# Push and create PR
git push origin phase_2_restaurants
```

---

## 🆘 Need Help?

1. Check [BACKEND_SETUP.md](./BACKEND_SETUP.md)
2. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
3. Review git commits: `git log --oneline`
4. Check API docs: http://localhost:3000/api/docs

---

**Happy Coding! 🎉**

Phase 1 is complete. Ready for Phase 2!
