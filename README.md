api usage guide

# API Usage Examples

Base URL: `http://localhost:3000/api`

## Categories

### Create Category
```bash
POST /categories
Content-Type: application/json

{
  "name": "Beverages",
  "description": "Hot and cold drinks",
  "tax_applicable": true,
  "tax_percentage": 18,
  "image": "https://example.com/beverages.jpg"
}
```

### Get All Categories
```bash
GET /categories?page=1&limit=10&sort_by=name&order=asc&active_only=true
```

### Update Category
```bash
PUT /categories/:id
Content-Type: application/json

{
  "tax_percentage": 20
}
```

### Soft Delete Category
```bash
DELETE /categories/:id
```

## Subcategories

### Create Subcategory
```bash
POST /subcategories
Content-Type: application/json

{
  "category": "65a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Hot Coffee",
  "description": "Espresso-based drinks",
  "tax_applicable": false
}
```

### Get Subcategories by Category
```bash
GET /subcategories?category=65a1b2c3d4e5f6a7b8c9d0e1
```

## Items

### Create Item with Static Pricing
```bash
POST /items
Content-Type: application/json

{
  "name": "Cappuccino",
  "description": "Classic Italian coffee",
  "category": "65a1b2c3d4e5f6a7b8c9d0e1",
  "pricing_type": "static",
  "pricing_config": {
    "price": 200
  },
  "addons": [
    {
      "name": "Extra Shot",
      "price": 50,
      "is_mandatory": false
    },
    {
      "name": "Oat Milk",
      "price": 40,
      "is_mandatory": false,
      "group": "Milk Options"
    }
  ]
}
```

### Create Item with Tiered Pricing
```bash
POST /items
Content-Type: application/json

{
  "name": "Meeting Room",
  "description": "Conference room with projector",
  "category": "65a1b2c3d4e5f6a7b8c9d0e1",
  "pricing_type": "tiered",
  "pricing_config": {
    "tiers": [
      { "max_quantity": 1, "price": 300 },
      { "max_quantity": 2, "price": 500 },
      { "max_quantity": 4, "price": 800 }
    ]
  },
  "is_bookable": true,
  "availability": {
    "days": [1, 2, 3, 4, 5],
    "slots": [
      { "start_time": "10:00", "end_time": "11:00" },
      { "start_time": "14:00", "end_time": "15:00" },
      { "start_time": "17:00", "end_time": "18:00" }
    ]
  }
}
```

### Create Item with Dynamic Pricing
```bash
POST /items
Content-Type: application/json

{
  "name": "Breakfast Combo",
  "description": "Eggs, toast, and coffee",
  "subcategory": "65a1b2c3d4e5f6a7b8c9d0e2",
  "pricing_type": "dynamic",
  "pricing_config": {
    "windows": [
      { "start_time": "08:00", "end_time": "11:00", "price": 199 },
      { "start_time": "11:00", "end_time": "22:00", "price": 299 }
    ]
  }
}
```

### Create Complimentary Item
```bash
POST /items
Content-Type: application/json

{
  "name": "Welcome Drink",
  "description": "Free welcome beverage",
  "category": "65a1b2c3d4e5f6a7b8c9d0e1",
  "pricing_type": "complimentary",
  "pricing_config": {
    "description": "Complimentary on arrival"
  }
}
```

### Create Discounted Item
```bash
POST /items
Content-Type: application/json

{
  "name": "Happy Hour Beer",
  "category": "65a1b2c3d4e5f6a7b8c9d0e1",
  "pricing_type": "discounted",
  "pricing_config": {
    "base_price": 500,
    "discount_type": "percentage",
    "discount_value": 20
  }
}
```

### Get Item Price
```bash
GET /items/:id/price?quantity=2&time=2024-01-15T10:30:00Z

Response:
{
  "success": true,
  "item": {
    "id": "65a1b2c3d4e5f6a7b8c9d0e3",
    "name": "Meeting Room"
  },
  "pricing_rule": "tiered",
  "base_price": 500,
  "discount": 0,
  "addons_total": 0,
  "subtotal": 500,
  "tax_applicable": true,
  "tax_percentage": 18,
  "tax_amount": 90,
  "grand_total": 590,
  "final_price": 590
}
```

### Search Items
```bash
GET /items/search?q=coffee&min_price=100&max_price=500&category=65a1b2c3d4e5f6a7b8c9d0e1&active_only=true
```

## Bookings

### Check Availability
```bash
GET /items/:id/availability?date=2024-01-20

Response:
{
  "success": true,
  "data": {
    "available": true,
    "date": "2024-01-20",
    "day_of_week": 6,
    "total_slots": 3,
    "available_slots": [
      { "start_time": "10:00", "end_time": "11:00" },
      { "start_time": "17:00", "end_time": "18:00" }
    ],
    "booked_slots": 1
  }
}
```

### Create Booking
```bash
POST /bookings
Content-Type: application/json

{
  "item": "65a1b2c3d4e5f6a7b8c9d0e3",
  "date": "2024-01-20",
  "start_time": "10:00",
  "end_time": "11:00",
  "user_name": "John Doe",
  "user_email": "john@example.com"
}
```

### Get Bookings
```bash
GET /bookings?item=65a1b2c3d4e5f6a7b8c9d0e3&date=2024-01-20&user_email=john@example.com
```

### Cancel Booking
```bash
PATCH /bookings/:id/cancel
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Specific error message"
    }
  ]
}
```

## Common Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Sorting
- `sort_by`: Field to sort by (name, price, createdAt)
- `order`: Sort order (asc, desc)

### Filtering
- `active_only`: true/false
- `category`: Category ID
- `subcategory`: Subcategory ID



testing guide


# Testing Guide

This guide walks you through testing all the main features of the Menu Management System.

## Setup

1. Make sure the server is running:
```bash
npm run dev
```

2. You can use any HTTP client (Postman, Insomnia, curl, or Thunder Client in VS Code)

## Test Scenario: Coffee Shop

Let's build a complete coffee shop menu system to demonstrate all features.

### Step 1: Create a Category with Tax

```bash
POST http://localhost:3000/api/categories
Content-Type: application/json

{
  "name": "Beverages",
  "description": "Hot and cold drinks",
  "tax_applicable": true,
  "tax_percentage": 18
}
```

Save the returned `_id` as `CATEGORY_ID`

### Step 2: Create a Subcategory (Inherits Tax)

```bash
POST http://localhost:3000/api/subcategories
Content-Type: application/json

{
  "category": "CATEGORY_ID",
  "name": "Hot Coffee",
  "description": "Espresso-based hot beverages"
}
```

Save the returned `_id` as `SUBCATEGORY_ID`

Note: This subcategory will inherit the 18% tax from its parent category.

### Step 3: Create Static Priced Item

```bash
POST http://localhost:3000/api/items
Content-Type: application/json

{
  "name": "Cappuccino",
  "description": "Classic Italian espresso with steamed milk",
  "subcategory": "SUBCATEGORY_ID",
  "pricing_type": "static",
  "pricing_config": {
    "price": 200
  },
  "addons": [
    {
      "name": "Extra Shot",
      "price": 50,
      "is_mandatory": false
    },
    {
      "name": "Oat Milk",
      "price": 40,
      "is_mandatory": false,
      "group": "Milk Options"
    },
    {
      "name": "Soy Milk",
      "price": 40,
      "is_mandatory": false,
      "group": "Milk Options"
    }
  ]
}
```

Save the returned `_id` as `CAPPUCCINO_ID`

### Step 4: Test Tax Inheritance

Get the price for the cappuccino:

```bash
GET http://localhost:3000/api/items/CAPPUCCINO_ID/price
```

Expected response:
```json
{
  "success": true,
  "item": {
    "id": "CAPPUCCINO_ID",
    "name": "Cappuccino"
  },
  "pricing_rule": "static",
  "base_price": 200,
  "discount": 0,
  "addons_total": 0,
  "subtotal": 200,
  "tax_applicable": true,
  "tax_percentage": 18,
  "tax_amount": 36,
  "grand_total": 236,
  "final_price": 236
}
```

Notice the 18% tax is applied even though the item doesn't define it.

### Step 5: Update Category Tax

Now update the category tax to see inheritance in action:

```bash
PUT http://localhost:3000/api/categories/CATEGORY_ID
Content-Type: application/json

{
  "tax_percentage": 20
}
```

### Step 6: Verify Tax Update Propagated

Get the price again:

```bash
GET http://localhost:3000/api/items/CAPPUCCINO_ID/price
```

The tax should now be 20% instead of 18%, demonstrating dynamic inheritance.

### Step 7: Create Tiered Pricing Item

```bash
POST http://localhost:3000/api/items
Content-Type: application/json

{
  "name": "Meeting Room",
  "description": "Private meeting space with projector",
  "category": "CATEGORY_ID",
  "pricing_type": "tiered",
  "pricing_config": {
    "tiers": [
      { "max_quantity": 1, "price": 300 },
      { "max_quantity": 2, "price": 500 },
      { "max_quantity": 4, "price": 800 }
    ]
  },
  "is_bookable": true,
  "availability": {
    "days": [1, 2, 3, 4, 5],
    "slots": [
      { "start_time": "09:00", "end_time": "10:00" },
      { "start_time": "10:00", "end_time": "11:00" },
      { "start_time": "14:00", "end_time": "15:00" },
      { "start_time": "15:00", "end_time": "16:00" }
    ]
  }
}
```

Save the returned `_id` as `MEETING_ROOM_ID`

### Step 8: Test Tiered Pricing

Test different quantities:

```bash
GET http://localhost:3000/api/items/MEETING_ROOM_ID/price?quantity=1
# Should return base_price: 300

GET http://localhost:3000/api/items/MEETING_ROOM_ID/price?quantity=2
# Should return base_price: 500

GET http://localhost:3000/api/items/MEETING_ROOM_ID/price?quantity=4
# Should return base_price: 800
```

### Step 9: Create Dynamic Pricing Item

```bash
POST http://localhost:3000/api/items
Content-Type: application/json

{
  "name": "Breakfast Special",
  "description": "Eggs, toast, and coffee combo",
  "subcategory": "SUBCATEGORY_ID",
  "pricing_type": "dynamic",
  "pricing_config": {
    "windows": [
      { "start_time": "08:00", "end_time": "11:00", "price": 199 },
      { "start_time": "11:00", "end_time": "14:00", "price": 249 },
      { "start_time": "14:00", "end_time": "22:00", "price": 299 }
    ]
  }
}
```

Save as `BREAKFAST_ID`

### Step 10: Test Time-Based Pricing

```bash
GET http://localhost:3000/api/items/BREAKFAST_ID/price?time=2024-01-15T09:00:00Z
# Should return base_price: 199 (morning window)

GET http://localhost:3000/api/items/BREAKFAST_ID/price?time=2024-01-15T12:00:00Z
# Should return base_price: 249 (lunch window)

GET http://localhost:3000/api/items/BREAKFAST_ID/price?time=2024-01-15T18:00:00Z
# Should return base_price: 299 (evening window)
```

### Step 11: Check Booking Availability

```bash
GET http://localhost:3000/api/items/MEETING_ROOM_ID/availability?date=2024-01-22
```

Expected response shows available slots for that Monday.

### Step 12: Create a Booking

```bash
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "item": "MEETING_ROOM_ID",
  "date": "2024-01-22",
  "start_time": "10:00",
  "end_time": "11:00",
  "user_name": "Sarah Johnson",
  "user_email": "sarah@example.com"
}
```

Save as `BOOKING_ID`

### Step 13: Verify Double Booking Prevention

Try to book the same slot again:

```bash
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "item": "MEETING_ROOM_ID",
  "date": "2024-01-22",
  "start_time": "10:00",
  "end_time": "11:00",
  "user_name": "John Doe",
  "user_email": "john@example.com"
}
```

Should return error: "This time slot is already booked"

### Step 14: Check Updated Availability

```bash
GET http://localhost:3000/api/items/MEETING_ROOM_ID/availability?date=2024-01-22
```

The 10:00-11:00 slot should now be missing from available_slots.

### Step 15: Test Search

```bash
GET http://localhost:3000/api/items/search?q=coffee&active_only=true
```

Should return all items with "coffee" in name or description.

### Step 16: Test Pagination

```bash
GET http://localhost:3000/api/items?page=1&limit=2&sort_by=name&order=asc
```

### Step 17: Create Complimentary Item

```bash
POST http://localhost:3000/api/items
Content-Type: application/json

{
  "name": "Welcome Water",
  "description": "Complimentary water on arrival",
  "category": "CATEGORY_ID",
  "pricing_type": "complimentary",
  "pricing_config": {
    "description": "Free for all guests"
  }
}
```

Check the price - should always be 0.

### Step 18: Test Soft Delete

```bash
DELETE http://localhost:3000/api/categories/CATEGORY_ID
```

Then list categories with active_only=true - the category should be hidden.

```bash
GET http://localhost:3000/api/categories?active_only=true
```

### Step 19: Test Discounted Pricing

```bash
POST http://localhost:3000/api/items
Content-Type: application/json

{
  "name": "Happy Hour Special",
  "category": "CATEGORY_ID",
  "pricing_type": "discounted",
  "pricing_config": {
    "base_price": 500,
    "discount_type": "percentage",
    "discount_value": 25
  }
}
```

Price should be 375 (500 - 25% = 375)

## Edge Cases to Test

### Invalid Item Creation (Both Category and Subcategory)
```bash
POST http://localhost:3000/api/items
Content-Type: application/json

{
  "name": "Invalid Item",
  "category": "CATEGORY_ID",
  "subcategory": "SUBCATEGORY_ID",
  "pricing_type": "static",
  "pricing_config": { "price": 100 }
}
```
Should fail with validation error.

### Booking on Unavailable Day
```bash
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "item": "MEETING_ROOM_ID",
  "date": "2024-01-21",
  "start_time": "10:00",
  "end_time": "11:00",
  "user_name": "Test User",
  "user_email": "test@example.com"
}
```
Should fail because Jan 21, 2024 is a Sunday, and the room is only available Mon-Fri.

### Invalid Tier Pricing
```bash
POST http://localhost:3000/api/items
Content-Type: application/json

{
  "name": "Bad Tier Item",
  "category": "CATEGORY_ID",
  "pricing_type": "tiered",
  "pricing_config": {
    "tiers": []
  }
}
```
Should fail validation - tiers array must have at least one item.

## Success Criteria

If all these tests pass, your system correctly handles:

1. Tax inheritance across three levels
2. All five pricing types
3. Booking with conflict prevention
4. Soft deletes
5. Pagination and sorting
6. Search functionality
7. Add-ons pricing
8. Validation and error handling


design decisions

# Design Decisions & Architecture

This document explains the key design decisions made while building this system and the reasoning behind them.

## Database Choice: MongoDB

**Decision:** Use MongoDB with Mongoose ODM

**Reasoning:**
1. **Flexible Schema**: Different pricing types require different config structures. MongoDB's flexible schema is perfect for this.
2. **Nested Documents**: Add-ons and availability slots naturally fit as embedded documents.
3. **Rapid Development**: Mongoose provides excellent validation and middleware support.
4. **JSON-First**: APIs return JSON, MongoDB stores JSON-like documents - natural fit.

**Tradeoffs:**
- No enforced referential integrity (handled in application layer)
- Less optimal for complex joins (acceptable for this domain)
- No built-in transactions in older versions (though available in newer MongoDB)

**Alternative Considered:** PostgreSQL with JSONB columns
- Would provide referential integrity
- Better for complex reporting
- Rejected because pricing config flexibility was more important

## Architecture: Layered Approach

```
Routes → Controllers → Services → Models
```

**Why This Structure?**

1. **Routes**: Define endpoints and attach middleware
2. **Controllers**: Handle HTTP request/response, minimal logic
3. **Services**: Pure business logic, reusable, testable
4. **Models**: Data structure and basic validation

**Benefits:**
- Clear separation of concerns
- Easy to test services independently
- Controllers stay thin and focused
- Business logic reusable across different entry points

**Alternative Considered:** Feature-based structure
- Group by feature instead of layer
- Rejected because the domain is small enough that layered is clearer

## Tax Inheritance Implementation

**Decision:** Runtime calculation with population

**How It Works:**
```javascript
Item → check item.tax_applicable
  ↓ (if undefined)
Item → Subcategory → check subcategory.tax_applicable
  ↓ (if undefined)
Subcategory → Category → use category.tax_applicable
```

**Code Implementation:**
```javascript
function getTaxForItem(item) {
  if (item.tax_applicable !== undefined) {
    return { applicable: item.tax_applicable, percentage: item.tax_percentage };
  }
  if (item.subcategory?.tax_applicable !== undefined) {
    return { applicable: item.subcategory.tax_applicable, percentage: item.subcategory.tax_percentage };
  }
  return getCategoryTax(item.subcategory?.category || item.category);
}
```

**Why This Approach?**

✅ **Instant Propagation**: Change category tax, all items reflect it immediately
✅ **No Sync Issues**: No need to update thousands of items when tax changes
✅ **Clear Chain**: Easy to debug inheritance path
✅ **Audit Trail**: Original values remain unchanged

**Tradeoffs:**
⚠️ **Performance**: Requires populating relations on every query
⚠️ **Database Queries**: More queries than storing computed values

**Alternative Considered:** Denormalized (store computed tax on items)
- Faster queries
- Rejected because sync complexity and risk of stale data

**When Tax Changes:**
No code needed! Just update the category:
```javascript
await Category.findByIdAndUpdate(id, { tax_percentage: 20 });
```
All items inherit the new value on next fetch.

## Pricing Engine Design

**Decision:** Polymorphic pricing_config field + service layer calculation

**Schema Design:**
```javascript
{
  pricing_type: 'static' | 'tiered' | 'complimentary' | 'discounted' | 'dynamic',
  pricing_config: Mixed // Shape depends on pricing_type
}
```

**Why Not Separate Collections?**

Having 5 different collections (StaticItem, TieredItem, etc.) would:
- Create complex queries when listing all items
- Duplicate common fields
- Make the API inconsistent

**Validation Strategy:**
Use Joi's conditional validation:
```javascript
pricing_config: Joi.when('pricing_type', {
  switch: [
    { is: 'static', then: Joi.object({ price: Joi.number().required() }) },
    { is: 'tiered', then: Joi.object({ tiers: Joi.array().required() }) },
    // ...
  ]
})
```

**Calculation Pattern:**
All pricing logic lives in `pricingService.js`:
```javascript
calculatePrice(item, options) {
  switch (item.pricing_type) {
    case 'static': return this.calculateStaticPrice(item.pricing_config);
    case 'tiered': return this.calculateTieredPrice(item.pricing_config, quantity);
    // ...
  }
}
```

**Benefits:**
- Single source of truth for pricing logic
- Easy to add new pricing types
- Testable in isolation
- Consistent calculation across the app

## Booking System Design

**Decision:** Separate Booking collection with conflict checking

**Schema:**
```javascript
{
  item: ObjectId,
  date: Date,
  start_time: String,
  end_time: String,
  user_name: String,
  user_email: String,
  status: 'confirmed' | 'cancelled'
}
```

**Conflict Prevention:**
```javascript
const conflict = await Booking.findOne({
  item: itemId,
  date: { $gte: startOfDay, $lt: endOfDay },
  status: 'confirmed',
  $or: [{ start_time: { $lt: endTime }, end_time: { $gt: startTime } }]
});
```

**Why This Works:**
- Checks for time overlap using standard interval intersection logic
- Filters by confirmed status only
- Uses compound index for fast lookups

**Race Condition Handling:**
Current implementation does check-then-create. For production, I would:
1. Use MongoDB transactions
2. Add optimistic locking with version fields
3. Implement retry logic

**Alternative Considered:** Embed bookings in items
- Rejected because it would create huge documents
- Harder to query "all bookings by user"

## Soft Delete Strategy

**Decision:** is_active boolean flag

**Implementation:**
```javascript
// Soft delete
await Category.findByIdAndUpdate(id, { is_active: false });

// Filter in queries
const query = { is_active: true };
```

**Benefits:**
- Data preservation for audit/recovery
- Maintains referential relationships
- Can reactivate if needed

**Cascade Behavior:**
When category is inactive, we filter subcategories and items in application logic.

**Alternative Considered:** deleted_at timestamp
- More info (when deleted)
- Rejected for simplicity

## Validation Approach

**Decision:** Joi for request validation, Mongoose for data validation

**Layer Responsibilities:**

1. **Joi (Middleware)**: Request validation before controller
   - Type checking
   - Required fields
   - Format validation
   - Custom rules

2. **Mongoose (Model)**: Database-level validation
   - Unique constraints
   - Schema enforcement
   - Pre-save hooks

**Why Both?**
- Joi catches issues early with clear messages
- Mongoose prevents invalid data at DB level
- Defense in depth

**Example:**
```javascript
// Joi validates request
validateItem(req.body);

// Mongoose validates before save
itemSchema.pre('validate', function(next) {
  if (this.category && this.subcategory) {
    next(new Error('Cannot have both'));
  }
  next();
});
```

## Add-ons Implementation

**Decision:** Embed add-ons in items

**Schema:**
```javascript
addons: [{
  name: String,
  price: Number,
  is_mandatory: Boolean,
  group: String
}]
```

**Why Embedded?**
- Add-ons are specific to items
- Always fetched together
- Simple to manage
- No extra queries needed

**Pricing Integration:**
```javascript
const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
const subtotal = basePrice + addonsTotal;
```

**Future Enhancement:**
Could add a separate AddOnGroup collection for:
- "Choose 1 of 3 sauces"
- Min/max selection rules
- Currently kept simple

## Error Handling

**Decision:** Centralized error middleware + async wrapper

**Pattern:**
```javascript
// Async wrapper prevents try-catch in every controller
exports.getItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new Error('Item not found');
  res.json({ success: true, data: item });
});

// Central error handler
app.use((err, req, res, next) => {
  // Handle all errors consistently
});
```

**Error Types Handled:**
1. Validation errors (400)
2. Not found errors (404)
3. Duplicate key errors (409)
4. Cast errors (400)
5. Generic errors (500)

**Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "name", "message": "Field error" }]
}
```

## API Design Patterns

**Consistent Response Format:**
```javascript
// Success
{ success: true, data: {...}, pagination: {...} }

// Error
{ success: false, message: "Error", errors: [...] }
```

**Query Parameters:**
- `page`, `limit` - Pagination
- `sort_by`, `order` - Sorting
- `active_only` - Filtering
- Specific filters per resource

**RESTful Routes:**
- `GET /items` - List
- `POST /items` - Create
- `GET /items/:id` - Read
- `PUT /items/:id` - Update
- `DELETE /items/:id` - Soft delete

**Special Endpoints:**
- `GET /items/:id/price` - Dynamic calculation
- `GET /items/:id/availability` - Booking availability
- `GET /items/search` - Advanced search

## Performance Considerations

**Indexes Added:**
```javascript
// Category
categorySchema.index({ name: 1 });
categorySchema.index({ is_active: 1 });

// Item
itemSchema.index({ category: 1, subcategory: 1, name: 1 }, { unique: true });
itemSchema.index({ is_active: 1 });
itemSchema.index({ pricing_type: 1 });

// Booking
bookingSchema.index({ item: 1, date: 1, start_time: 1, status: 1 });
```

**Population Strategy:**
Only populate when needed:
```javascript
// List view - no population (faster)
await Item.find(query);

// Detail view - full population
await Item.findById(id).populate('category').populate('subcategory');
```

**Future Optimizations:**
1. Add Redis caching for frequently accessed items
2. Implement pagination cursor instead of offset
3. Add database read replicas for scaling
4. Use aggregation pipelines for complex queries

## What I Would Do Differently

Given more time or for production:

1. **Testing**: Add comprehensive unit and integration tests
2. **Transactions**: Use MongoDB transactions for bookings
3. **Caching**: Redis for categories and popular items
4. **Rate Limiting**: Protect against abuse
5. **Authentication**: JWT-based auth
6. **Logging**: Winston or Pino for structured logs
7. **Monitoring**: Prometheus metrics, health checks
8. **Documentation**: Swagger/OpenAPI spec
9. **Validation**: More extensive edge case handling
10. **Deployment**: Docker compose, CI/CD pipeline

## Key Learnings

1. **Schema design is critical**: Spent time upfront modeling relationships correctly, saved refactoring later.

2. **Service layer separation works**: Keeping business logic in services made the code much more testable and maintainable.

3. **Validation is complex**: Different pricing types need different validation rules. Joi's conditional validation was perfect for this.

4. **Runtime calculation vs storage**: For tax inheritance, runtime calculation was the right choice despite the performance cost.

5. **Start simple, add complexity when needed**: Initially considered many features but focused on core requirements first.

## Conclusion

This system demonstrates:
- Clean architecture with clear separation of concerns
- Sophisticated business logic (pricing engine, tax inheritance)
- Proper validation and error handling
- RESTful API design
- Production-ready patterns (soft deletes, pagination, indexing)

The focus was on correctness, maintainability, and clear code over premature optimization or adding unnecessary features.


✅ All Core Requirements:

Tax Inheritance: Runtime calculation, instantly propagates changes
Soft Deletes: is_active flag with cascade behavior
Pagination & Sorting: On all list endpoints
Search: Full-text search with filters
5 Pricing Types: Static, Tiered, Complimentary, Discounted, Dynamic
Booking System: Double-booking prevention, availability checking
Add-ons: Support for optional/mandatory add-ons with groups

🎯 Professional Touches:

Clean, layered architecture
Comprehensive validation with Joi
Proper error handling
Meaningful commit history structure (guidelines provided)
Production-ready patterns
Clear, maintainable code with minimal but helpful comments
Human-readable, plain English documentation

🚀 Next Steps

Clone/Create the repository structure with these files
Run setup:

bash   npm install
   npm run seed  # Load sample data
   npm run dev   # Start development server

Test using the TESTING_GUIDE.md scenarios
Record your Loom video explaining:

Schema relationships
Tax inheritance implementation
Pricing engine
Key challenges faced
