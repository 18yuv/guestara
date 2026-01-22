import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Item from '../models/Item.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await Item.deleteMany({});
    console.log('Cleared existing data');

    const beveragesCategory = await Category.create({
      name: 'Beverages',
      description: 'Hot and cold drinks',
      tax_applicable: true,
      tax_percentage: 18
    });

    const foodCategory = await Category.create({
      name: 'Food',
      description: 'Breakfast, lunch, and dinner items',
      tax_applicable: true,
      tax_percentage: 5
    });

    const servicesCategory = await Category.create({
      name: 'Services',
      description: 'Bookable services and experiences',
      tax_applicable: true,
      tax_percentage: 18
    });

    console.log('Created categories');

    const hotCoffee = await Subcategory.create({
      category: beveragesCategory._id,
      name: 'Hot Coffee',
      description: 'Espresso-based hot beverages'
    });

    const coldDrinks = await Subcategory.create({
      category: beveragesCategory._id,
      name: 'Cold Drinks',
      description: 'Iced beverages and smoothies',
      tax_applicable: false
    });

    const breakfast = await Subcategory.create({
      category: foodCategory._id,
      name: 'Breakfast',
      description: 'Morning specials'
    });

    console.log('Created subcategories');

    await Item.create({
      name: 'Cappuccino',
      description: 'Classic Italian espresso with steamed milk foam',
      subcategory: hotCoffee._id,
      pricing_type: 'static',
      pricing_config: { price: 200 },
      addons: [
        { name: 'Extra Shot', price: 50, is_mandatory: false },
        { name: 'Oat Milk', price: 40, is_mandatory: false, group: 'Milk Options' },
        { name: 'Soy Milk', price: 40, is_mandatory: false, group: 'Milk Options' },
        { name: 'Hazelnut Syrup', price: 30, is_mandatory: false, group: 'Flavors' }
      ]
    });

    await Item.create({
      name: 'Latte',
      description: 'Smooth espresso with steamed milk',
      subcategory: hotCoffee._id,
      pricing_type: 'static',
      pricing_config: { price: 220 },
      addons: [
        { name: 'Extra Shot', price: 50, is_mandatory: false },
        { name: 'Vanilla Syrup', price: 30, is_mandatory: false }
      ]
    });

    await Item.create({
      name: 'Iced Coffee',
      description: 'Refreshing cold brew coffee',
      subcategory: coldDrinks._id,
      pricing_type: 'discounted',
      pricing_config: {
        base_price: 250,
        discount_type: 'percentage',
        discount_value: 20
      }
    });

    await Item.create({
      name: 'Breakfast Combo',
      description: 'Eggs, toast, and coffee',
      subcategory: breakfast._id,
      pricing_type: 'dynamic',
      pricing_config: {
        windows: [
          { start_time: '08:00', end_time: '11:00', price: 199 },
          { start_time: '11:00', end_time: '14:00', price: 249 }
        ]
      }
    });

    await Item.create({
      name: 'Welcome Drink',
      description: 'Complimentary beverage on arrival',
      category: beveragesCategory._id,
      pricing_type: 'complimentary',
      pricing_config: { description: 'Free for all guests' }
    });

    await Item.create({
      name: 'Meeting Room',
      description: 'Private meeting space with projector and whiteboard',
      category: servicesCategory._id,
      pricing_type: 'tiered',
      pricing_config: {
        tiers: [
          { max_quantity: 1, price: 300 },
          { max_quantity: 2, price: 500 },
          { max_quantity: 4, price: 800 },
          { max_quantity: 8, price: 1200 }
        ]
      },
      is_bookable: true,
      availability: {
        days: [1, 2, 3, 4, 5],
        slots: [
          { start_time: '09:00', end_time: '10:00' },
          { start_time: '10:00', end_time: '11:00' },
          { start_time: '11:00', end_time: '12:00' },
          { start_time: '14:00', end_time: '15:00' },
          { start_time: '15:00', end_time: '16:00' },
          { start_time: '16:00', end_time: '17:00' }
        ]
      }
    });

    await Item.create({
      name: 'Yoga Class',
      description: 'One hour guided yoga session',
      category: servicesCategory._id,
      pricing_type: 'static',
      pricing_config: { price: 500 },
      is_bookable: true,
      availability: {
        days: [0, 1, 2, 3, 4, 5, 6],
        slots: [
          { start_time: '06:00', end_time: '07:00' },
          { start_time: '07:00', end_time: '08:00' },
          { start_time: '18:00', end_time: '19:00' }
        ]
      }
    });

    console.log('Created items');
    console.log('Seed data created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();