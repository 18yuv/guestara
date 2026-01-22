# Menu & Services Management Backend

A sophisticated backend system for managing restaurant menus, services, and bookings with advanced pricing logic, tax inheritance, and availability management.

## 🎥 Demo Video
[**Watch the Loom Walkthrough →**](your-loom-link-here)

## ✨ Key Features

- **Tax Inheritance System**: Dynamic tax calculation across category → subcategory → item hierarchy
- **5 Pricing Types**: Static, Tiered, Complimentary, Discounted, and Time-based Dynamic pricing
- **Booking Management**: Availability checking with double-booking prevention
- **Soft Deletes**: Data preservation with `is_active` flag
- **Add-ons System**: Support for optional/mandatory add-ons with grouping
- **Search & Filtering**: Full-text search with multiple filters
- **Pagination & Sorting**: Efficient data retrieval on all list endpoints

## 🏗️ Architecture
```
src/
├── config/          # Database configuration
├── models/          # Mongoose schemas
├── controllers/     # Request handlers
├── services/        # Business logic layer
├── routes/          # API endpoints
├── middlewares/     # Validation & error handling
└── utils/           # Helper utilities
```

**Architecture Pattern**: Layered architecture with clear separation of concerns
- Routes handle HTTP routing
- Controllers manage request/response
- Services contain business logic
- Models define data structure

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+

### Installation

1. Clone the repository
```bash
git clone https://github.com/18yuv/guestara.git
cd guestara
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/menu_management
NODE_ENV=development
```

4. Start MongoDB
```bash
mongod
```

5. Seed sample data
```bash
npm run seed
```

6. Start the server
```bash
npm run dev
```

7. Test the API
```bash
curl http://localhost:3000/health
```

## 🔑 Core Implementations

### Tax Inheritance

Tax is calculated at runtime following this chain:
```
Item → Subcategory → Category
```

**Example**: If a category has 18% tax and an item doesn't define its own tax, the item automatically inherits 18%. Update the category to 20%, and all items instantly reflect the new rate.

**Implementation**: See `src/services/taxService.js`

### Pricing Engine

Supports 5 pricing types with polymorphic `pricing_config`:
```javascript
// Static
{ pricing_type: 'static', pricing_config: { price: 200 } }

// Tiered (bulk discounts)
{ pricing_type: 'tiered', pricing_config: { 
  tiers: [
    { max_quantity: 1, price: 300 },
    { max_quantity: 4, price: 800 }
  ]
}}

// Dynamic (time-based)
{ pricing_type: 'dynamic', pricing_config: { 
  windows: [
    { start_time: "08:00", end_time: "11:00", price: 199 }
  ]
}}
```

**Implementation**: See `src/services/pricingService.js`

### Booking System

- Prevents double bookings using time interval intersection
- Checks day-of-week availability
- Validates against configured time slots

**Implementation**: See `src/services/bookingService.js`

## 📚 Documentation

- **[API Examples](./docs/API_EXAMPLES.md)** - Complete API reference with examples
- **[Testing Guide](./docs/TESTING_GUIDE.md)** - Step-by-step testing scenarios
- **[Design Decisions](./docs/DESIGN_DECISIONS.md)** - Architecture rationale

## 🧪 Testing

Run the seed script to populate sample data:
```bash
npm run seed
```

This creates:
- 3 categories (Beverages, Food, Services)
- 3 subcategories
- 7 items demonstrating all pricing types
- Bookable items with availability slots

Follow the [Testing Guide](./docs/TESTING_GUIDE.md) for comprehensive test scenarios.

## 💭 Reflections

### Why MongoDB?

I chose MongoDB for several key reasons:

1. **Schema Flexibility**: The pricing system requires different config structures for each pricing type. MongoDB's flexible schema allows me to use a polymorphic `pricing_config` field that adapts based on `pricing_type`.

2. **Nested Documents**: Add-ons and availability slots are naturally modeled as embedded arrays, avoiding extra queries.

3. **Rapid Development**: Mongoose provides excellent validation and middleware hooks for business logic.

4. **JSON Native**: Since the API speaks JSON, storing JSON-like documents creates a natural impedance match.

The tradeoff is no enforced referential integrity, but I handle relationships at the application layer with proper validation.

### Three Things I Learned

1. **Runtime Calculation vs. Denormalization**: For tax inheritance, I initially considered storing computed tax values on items. However, runtime calculation ensures instant propagation of changes without complex synchronization logic. The slight performance cost is worth the correctness guarantee.

2. **Conditional Validation Complexity**: Different pricing types need radically different validation rules. Joi's `when()` method with `switch` cases was perfect for this, allowing type-specific validation that catches errors before they reach the database.

3. **Time Interval Intersection Math**: Preventing double bookings required understanding interval overlap logic: `(start1 < end2 && end1 > start2)`. This simple formula catches all overlap scenarios elegantly.

### Biggest Challenge

The hardest challenge was **implementing tax inheritance correctly**.

**The Problem**: Items can belong to either a category OR a subcategory. Subcategories belong to categories. Tax can be defined at any level, or inherit from above. Changes to category tax must instantly affect all descendants.

**My Solution**:
- Tax fields are `undefined` by default (not `false` or `null`)
- Runtime calculation checks item → subcategory → category in sequence
- Population ensures all relationships are loaded before calculation
- No stored computed values, so changes propagate automatically

**Trade-offs**: This requires extra database queries (population) but eliminates:
- Complex synchronization code
- Risk of stale data
- Cascading updates on tax changes

The code clarity and correctness were worth the performance cost.

### Future Improvements

Given more time, I would:

1. **Comprehensive Testing**
   - Unit tests for services (tax, pricing, booking logic)
   - Integration tests for API endpoints
   - E2E tests for complete workflows
   - Current implementation has basic validation but lacks test coverage

2. **MongoDB Transactions**
   - Wrap booking creation in transactions
   - Prevent race conditions in high-concurrency scenarios
   - Add optimistic locking with version fields

3. **Caching Layer**
   - Redis for frequently-accessed categories and items
   - Cache invalidation on updates
   - Significant performance boost for read-heavy workloads

4. **Enhanced Security**
   - JWT authentication
   - Role-based access control
   - Rate limiting on endpoints
   - Input sanitization against injection

5. **Observability**
   - Structured logging with Winston/Pino
   - Prometheus metrics for monitoring
   - Distributed tracing with OpenTelemetry
   - Error tracking with Sentry

6. **API Documentation**
   - Swagger/OpenAPI specification
   - Interactive API explorer
   - Auto-generated from code comments

7. **DevOps**
   - Docker containerization
   - Docker Compose for local development
   - CI/CD pipeline with GitHub Actions
   - Automated testing and deployment

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi for request validation
- **Dev Tools**: Nodemon for hot reload

## 📊 API Endpoints

### Categories
- `POST /api/categories` - Create
- `GET /api/categories` - List with pagination
- `GET /api/categories/:id` - Get by ID
- `PUT /api/categories/:id` - Update
- `DELETE /api/categories/:id` - Soft delete

### Items
- `POST /api/items` - Create
- `GET /api/items` - List with filters
- `GET /api/items/:id` - Get by ID
- `GET /api/items/:id/price` - Calculate price dynamically
- `GET /api/items/search` - Search with filters
- `PUT /api/items/:id` - Update
- `DELETE /api/items/:id` - Soft delete

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `GET /api/items/:id/availability` - Check availability
- `PATCH /api/bookings/:id/cancel` - Cancel booking

## 👤 Author

Built as a technical assessment demonstrating system design, clean architecture, and complex business logic implementation.

## 📄 License

This project is for educational/assessment purposes.