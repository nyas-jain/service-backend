# Phase 3: Cart, Orders & PIN System - Implementation Plan

## Project Status Summary

✅ **Phase 1 & 2 Complete**
- Framework: NestJS 10.x with TypeScript
- Database: PostgreSQL (relational) + MongoDB (document) + Redis (caching)
- Modules: 5 (Auth, Users, Addresses, Restaurants, Menu)
- Endpoints: 38 tested and documented
- Code: 5,000+ lines of production-ready TypeScript
- Git: 11 clean commits with proper history
- Build: ✅ Compiling successfully with 0 errors

## Phase 3 Objectives

Build the core ordering system with 3 major modules:

### 1. **Favorites Module** (2-3 hours)
Allow customers to save favorite restaurants and dishes for quick reordering

**Endpoints to Build:**
- `POST /favorites/restaurants/:restaurantId` - Add favorite restaurant
- `DELETE /favorites/restaurants/:restaurantId` - Remove favorite restaurant
- `GET /favorites/restaurants` - Get all favorite restaurants
- `POST /favorites/items/:itemId` - Add favorite menu item
- `DELETE /favorites/items/:itemId` - Remove favorite menu item
- `GET /favorites/items` - Get all favorite items

**Database:**
- Create `favorite_restaurants` table (user_id, restaurant_id, created_at)
- Create `favorite_menu_items` table (user_id, menu_item_id, created_at)
- Indices on user_id and created_at for fast queries

**Features:**
- Soft-delete support (is_active boolean)
- Sorted by most recent
- Return full restaurant/item details with favorites
- List in separate endpoints

---

### 2. **Cart Module** (3-4 hours)
Shopping cart management with MongoDB for flexibility

**Endpoints to Build:**
- `POST /cart` - Add item to cart
- `GET /cart` - Get current cart
- `PUT /cart/items/:cartItemId` - Update item quantity
- `DELETE /cart/items/:cartItemId` - Remove item from cart
- `DELETE /cart` - Clear entire cart
- `POST /cart/validate` - Validate cart (check availability, minimums)

**Database (MongoDB):**
```typescript
interface Cart {
  _id: ObjectId,
  user_id: string (UUID)
  restaurant_id: string (UUID)
  items: [
    {
      _id: ObjectId,
      menu_item_id: string (UUID),
      quantity: number,
      price: decimal (at time of add),
      special_instructions?: string,
      added_at: Date
    }
  ],
  subtotal: decimal,
  created_at: Date,
  updated_at: Date,
  expires_at: Date (24 hours from creation)
}
```

**Features:**
- One cart per user per restaurant (auto-switch on different restaurant)
- Auto-calculate subtotal
- Check item availability before cart operations
- Apply dietary tag filters during add
- Validate minimum order amount from restaurant
- Auto-delete expired carts (24 hours)
- Store original price at time of add (for price change handling)

---

### 3. **PIN System** (3-4 hours)
Unique PINs for different delivery stages and security

**PIN Types:**

#### A. **Customer PIN** (4-digit)
- Generated when order is placed
- Used by delivery agent to confirm customer address
- Changes with every order

#### B. **Delivery Agent PIN** (4-digit)
- Assigned when user registers as delivery agent
- Static PIN for the agent
- Used to verify agent login and identity

#### C. **Pickup PIN** (4-digit)
- Generated for each order
- Used by restaurant to verify customer is picking up
- Shown on order receipt

#### D. **Delivery PIN** (4-digit)
- Generated during delivery
- Used by delivery agent to confirm delivery complete
- Requires customer PIN match to complete

**Endpoints to Build:**

*Delivery Agent PINs (Admin only):*
- `POST /pins/agents` - Generate PIN for delivery agent
- `PUT /pins/agents/:agentId` - Reset agent PIN
- `GET /pins/agents/:agentId` - Get agent PIN status

*Order-Related PINs (Auto-generated):*
- `GET /orders/:orderId/pins` - Get all PINs for order (customer_pin, pickup_pin, delivery_pin)
- `POST /pins/verify/customer/:orderId` - Verify customer PIN (for delivery agent)
- `POST /pins/verify/pickup/:orderId` - Verify pickup PIN (for restaurant)
- `POST /pins/verify/delivery/:orderId` - Verify delivery PIN (final confirmation)

**Database (PostgreSQL):**
```typescript
// Delivery Agent Identification PIN (static per agent)
DeliveryAgentPin {
  id: UUID,
  user_id: UUID (FK to User),
  pin: string (4-digit, hashed),
  is_active: boolean,
  created_at: Date,
  updated_at: Date,
  last_used_at?: Date
}

// Order-specific PINs (mongodb or separate table)
OrderPin {
  id: UUID,
  order_id: UUID,
  customer_pin: string (4-digit, hashed),
  pickup_pin: string (4-digit, hashed),
  delivery_pin: string (4-digit, hashed),

  customer_pin_verified: boolean,
  pickup_pin_verified: boolean,
  delivery_pin_verified: boolean,

  verified_at: Date?,
  created_at: Date,
  updated_at: Date
}
```

**Features:**
- 4-digit PINs generated randomly (0000-9999)
- Hash PINs before storage (bcrypt)
- Comparison with 3 failed attempts lockout (prevent brute force)
- Auto-expire order PINs after order completion (7 days)
- Audit trail: Log all PIN verification attempts
- Rate limiting on verification endpoints

---

## Implementation Strategy

### Branch Management
```bash
# Create new branch for Phase 3
git checkout phase_2_restaurant_menu
git pull origin phase_2_restaurant_menu
git checkout -b phase_3_cart_orders
```

### Development Order (Fastest Path)
1. **Favorites Module** - Simplest, good warm-up (PostgreSQL only)
2. **PIN System** - Core security feature (needed before Orders)
3. **Cart Module** - Depends on Menu validation (MongoDB integration)
4. **Order Module** - Will be Phase 3B (depends on Cart + PIN)

### File Structure for Phase 3

```
src/modules/
├── favorites/
│   ├── favorites.module.ts
│   ├── favorites.service.ts
│   ├── favorites.controller.ts
│   ├── dto/
│   │   ├── create-favorite.dto.ts
│   │   └── favorite-response.dto.ts
│
├── cart/
│   ├── cart.module.ts
│   ├── cart.service.ts
│   ├── cart.controller.ts
│   ├── dto/
│   │   ├── add-to-cart.dto.ts
│   │   ├── update-cart-item.dto.ts
│   │   └── cart-response.dto.ts
│
└── pins/
    ├── pins.module.ts
    ├── pins.service.ts
    ├── pins.controller.ts
    ├── dto/
    │   ├── generate-agent-pin.dto.ts
    │   ├── verify-pin.dto.ts
    │   └── pin-response.dto.ts
    └── utilities/
        └── pin-generator.ts

src/database/entities/
├── favorite-restaurant.entity.ts
├── favorite-menu-item.entity.ts
└── delivery-agent-pin.entity.ts
```

### Commands for Phase 3

```bash
# Start development server
npm run start:dev

# Build
npm run build

# Test (once Jest setup complete)
npm run test

# Commit Phase 3A (Favorites + Pins)
git add .
git commit -m "feat: Implement Favorites and PIN Management System

- Add Favorites module for saving restaurants and menu items
- Implement 4-digit PIN system for delivery agents
- Create order-specific PINs (customer, pickup, delivery)
- Add PIN verification endpoints with security
- Support soft-delete for favorites"

# Commit Phase 3B (Cart)
git commit -m "feat: Implement MongoDB-based Shopping Cart

- Create cart module with MongoDB integration
- Support one cart per user per restaurant
- Add item quantity management and validation
- Implement cart expiration (24 hours)
- Add price tracking at time of add
- Validate minimum order amount"

git push -u origin phase_3_cart_orders
```

## Timeline Estimate

- **Favorites Module**: 2-3 hours
- **PIN System**: 3-4 hours (includes bcrypt hashing, validation)
- **Cart Module**: 3-4 hours (MongoDB integration + validation)
- **Documentation**: 1-2 hours
- **Testing & Debugging**: 1-2 hours

**Total Phase 3: 10-15 hours** (can do in 1-2 days depending on focus)

## Key Dependencies & Considerations

### Required Libraries
- `bcryptjs` - For PIN hashing (already in package.json? check)
- `mongodb` - Already configured in app.module.ts
- `class-validator` - Already configured for DTOs

### Database Migrations
- After Phase 2, run `npm run typeorm migration:generate`
- This auto-detects new entities and creates migration files
- Always review migrations before running in production

### Testing Strategy
- Unit tests: Service methods with mocked repositories
- Integration tests: Endpoints with test database
- E2E tests: Full flow from API request to database

### Security Checklist for Phase 3
- [ ] PIN hashing (bcrypt) with salt rounds 10+
- [ ] Rate limiting on PIN verification (3 attempts, 15 min lockout)
- [ ] CORS configured correctly
- [ ] JWT validation on all protected endpoints
- [ ] Role-based access (RESTAURANT, DELIVERY_AGENT, CUSTOMER, ADMIN)
- [ ] Input validation on all DTOs
- [ ] Error messages don't leak sensitive info (no PIN counts in errors)

## Next Steps

1. **Before Phase 3 starts:**
   - Review Phase 1 & 2 code structure and patterns
   - Ensure PostgreSQL and MongoDB are running (docker-compose up)
   - Verify build is clean (npm run build)

2. **Phase 3 Development:**
   - Start with Favorites (simple SQL queries)
   - Then PIN System (security-focused)
   - Finally Cart (complex validation)
   - Document as you go

3. **After Phase 3:**
   - Phase 4: Orders Module (depends on Cart & PIN)
   - Phase 5: Payment Gateway integration
   - Phase 6: Delivery Agent & Tracking
   - Phase 7: AI Recommendations with nutritional data

## Notes for Development

- Follow the same patterns established in Phase 1 & 2
  - Use TypeORM for PostgreSQL queries
  - Use Mongoose for MongoDB (when added to package.json)
  - DTOs with class-validator decorators
  - Services with proper error handling
  - Controllers with role-based guards

- Keep it simple and focused
  - Don't over-engineer features
  - Write one endpoint at a time
  - Test each endpoint immediately

- Commit frequently
  - Commit after each major feature
  - Keep commit messages descriptive
  - Push to GitHub regularly to backup code

---

**Current Git Branches:**
- `phase_1_foundation` - Auth, Users, Addresses (5 commits)
- `phase_2_restaurant_menu` - Restaurants, Menu (6 commits including fixes)
- Ready for: `phase_3_cart_orders` - Cart, Orders, PIN System

**Build Status:** ✅ Clean - 0 errors, 0 warnings

**Ready to Begin:** Yes! The foundation is solid and ready for Phase 3 development.

---

*Plan created on: November 7, 2025*
*Status: Awaiting Phase 3 start*
