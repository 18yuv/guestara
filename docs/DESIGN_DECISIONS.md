# Design Decisions & Architecture
This document explains the key design decisions made while building this system and the reasoning behind them.

## Database Choice: MongoDB

Decision: Used MongoDB with Mongoose

Reasoning:
1. Flexible Schema: Different pricing types require different config structures. MongoDB's flexible schema is perfect for this.
2. Nested Documents: Add-ons and availability slots naturally fit as embedded documents.
3. Rapid Development: Mongoose provides excellent validation and middleware support.
4. JSON-First: APIs return JSON, MongoDB stores JSON-like documents - natural fit.
5. Familier : Have been working on mongoDb for my recent projects.

## Architecture: Layered Approach

```
Routes → Controllers → Services → Models
```

Why This Structure?

1. Routes: Define endpoints and attach middleware
2. Controllers: Handle HTTP request/response, minimal logic
3. Services: Pure business logic, reusable, testable
4. Models: Data structure and basic validation

Benefits:
- Clear separation of concerns
- Easy to test services independently
- Controllers stay thin and focused
- Business logic reusable across different entry points

Alternative: Feature-based structure
- Group by feature instead of layer
- Rejected because the domain is small enough that layered is clearer

## Tax Inheritance Implementation

Decision: Runtime calculation with population

How It Works:
```js
Item → check item.tax_applicable
  ↓ (if undefined)
Item → Subcategory → check subcategory.tax_applicable
  ↓ (if undefined)
Subcategory → Category → use category.tax_applicable
```

Code Implementation:
```js
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

Why This Approach?
 Instant Propagation: Change category tax, all items reflect it immediately
 No Sync Issues: No need to update thousands of items when tax changes
 Clear Chain: Easy to debug inheritance path
 Audit Trail: Original values remain unchanged

Tradeoffs:
 Performance: Requires populating relations on every query
 Database Queries: More queries than storing computed values

Alternative: store computed tax on items

When Tax Changes:
No code needed! Just update the category:
```js
await Category.findByIdAndUpdate(id, { tax_percentage: 20 });
```
All items inherit the new value on next fetch.

## Pricing Engine Design

Decision: Polymorphic pricing_config field + service layer calculation

Schema Design:
```js
{
  pricing_type: 'static' | 'tiered' | 'complimentary' | 'discounted' | 'dynamic',
  pricing_config: Mixed // Shape depends on pricing_type
}
```

Why Not Separate Collections?
Having 5 different collections (StaticItem, TieredItem, etc.) would:
- Create complex queries when listing all items
- Duplicate common fields
- Make the API inconsistent

Validation Strategy:
Use Joi's conditional validation:
```js
pricing_config: Joi.when('pricing_type', {
  switch: [
    { is: 'static', then: Joi.object({ price: Joi.number().required() }) },
    { is: 'tiered', then: Joi.object({ tiers: Joi.array().required() }) },
    // ...
  ]
})
```

Calculation Pattern:
All pricing logic lives in `pricingService.js`:
```js
calculatePrice(item, options) {
  switch (item.pricing_type) {
    case 'static': return this.calculateStaticPrice(item.pricing_config);
    case 'tiered': return this.calculateTieredPrice(item.pricing_config, quantity);
    // ...
  }
}
```

Benefits:
- Single source of truth for pricing logic
- Easy to add new pricing types
- Consistent calculation across the app

## Booking System Design

Decision: Separate Booking collection with conflict checking
Schema:
```js
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

Conflict Prevention:
```js
const conflict = await Booking.findOne({
  item: itemId,
  date: { $gte: startOfDay, $lt: endOfDay },
  status: 'confirmed',
  $or: [{ start_time: { $lt: endTime }, end_time: { $gt: startTime } }]
});
```

## Soft Delete Strategy

Decision: is_active boolean flag
Implementation:
```js
// Soft delete
await Category.findByIdAndUpdate(id, { is_active: false });

// Filter in queries
const query = { is_active: true };
```

## Validation Approach

Decision: Joi for request validation, Mongoose for data validation
Layer Responsibilities:

1. Joi (Middleware): Request validation before controller
   - Type checking
   - Required fields
   - Format validation
   - Custom rules

2. Mongoose (Model): Database-level validation
   - Unique constraints
   - Schema enforcement
   - Pre-save hooks

Why Both?
- Joi catches issues early with clear messages
- Mongoose prevents saving invalid data at DB level
- Defense in depth

Example:
```js
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

Decision: Embed add-ons in items
Schema:
```js
addons: [{
  name: String,
  price: Number,
  is_mandatory: Boolean,
  group: String
}]
```

Why Embedded?
- Add-ons are specific to items
- Always fetched together
- Simple to manage
- No extra queries needed

Pricing Integration:
```js
const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
const subtotal = basePrice + addonsTotal;
```

Future Enhancement:
Could add a separate AddOnGroup collection for:
- "Choose 1 of 3 sauces"
- Min/max selection rules
- Currently kept simple

## Error Handling

Decision: Centralized error middleware + async wrapper
Pattern:
```js
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

Error Types Handled:
1. Validation errors (400)
2. Not found errors (404)
3. Duplicate key errors (409)
4. Cast errors (400)
5. Generic errors (500)

Response Format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "name", "message": "Field error" }]
}
```

## API Design Patterns

Consistent Response Format:
```js
{ success: true, data: {...}, pagination: {...} }

{ success: false, message: "Error", errors: [...] }
```

Query Parameters:
- `page`, `limit` - Pagination
- `sort_by`, `order` - Sorting
- `active_only` - Filtering
- Specific filters per resource

RESTful Routes:
- `GET /items` - List
- `POST /items` - Create
- `GET /items/:id` - Read
- `PUT /items/:id` - Update
- `DELETE /items/:id` - Soft delete

Special Endpoints:
- `GET /items/:id/price` - Dynamic calculation
- `GET /items/:id/availability` - Booking availability
- `GET /items/search` - Advanced search

## What I Would Do Differently

Given more time or for production:

1. Testing: Add security tests
2. Transactions: Use MongoDB transactions for bookings
3. Caching: Redis for categories and popular items
4. Rate Limiting: Protect against abuse for all routes
5. Authentication: JWT-based auth and Email/Password Flows
6. Validation: More extensive edge case handling
7. Deployment: Vercel, Docker, CI/CD pipeline

## Key Learnings

1. Schema design is critical: Spent time upfront modeling relationships correctly, saved refactoring later.
2. Service layer separation works: Keeping business logic in services made the code much more testable and maintainable.
3. Validation is complex: Different pricing types need different validation rules. Joi's conditional validation was perfect for this.
4. Runtime calculation vs storage: For tax inheritance, runtime calculation was the right choice despite the performance cost.
5. Start simple, add complexity when needed: Initially considered many features but focused on core requirements.

## Conclusion

This system demonstrates:
- Clean architecture with clear separation of concerns
- Business logic (pricing engine, tax inheritance)
- Proper validation and error handling
- RESTful API design
- Production-ready patterns (soft deletes, pagination, indexing)

The focus was on correctness, maintainability, and clear code over premature optimization or adding unnecessary features.

All Core Requirements:

- Tax Inheritance: Runtime calculation, instantly propagates changes
- Soft Deletes: is_active flag with cascade behavior
- Pagination & Sorting: On all list endpoints
- Search: Full-text search with filters
- 5 Pricing Types: Static, Tiered, Complimentary, Discounted, Dynamic
- Booking System: Double-booking prevention, availability checking
- Add-ons: Support for optional/mandatory add-ons with groups

Professional Touches:

- Clean, layered architecture
- Comprehensive validation with Joi
- Proper error handling
- Meaningful commit history structure (guidelines provided)
- Production-ready patterns
- Clear, maintainable code with minimal but helpful comments
- Human-readable, plain English documentation, Used Ai to express clearly and efficiently