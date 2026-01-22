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