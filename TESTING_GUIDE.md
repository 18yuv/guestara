
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