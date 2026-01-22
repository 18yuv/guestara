// Build a Menu & Services Management Backend similar to what a real restaurant / booking / SaaS product would use.

// The system manages:
// Categories
// Subcategories (optional)
// Items (food, services, rooms, experiences, etc.)
// Pricing logic
// Availability & booking
// Add-ons
import 'dotenv/config';
import connectMongo from './config/connection';
await connectMongo()