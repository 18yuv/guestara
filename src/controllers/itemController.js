import Item from '../models/Item.js';
import pricingService from '../services/pricingService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const createItem = asyncHandler(async (req, res) => {
  const item = await Item.create(req.body);
  
  res.status(201).json({
    success: true,
    data: item
  });
});

export const getItems = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sort_by = 'createdAt', 
    order = 'desc',
    active_only,
    category,
    subcategory,
    pricing_type
  } = req.query;
  
  const query = {};
  
  if (active_only === 'true') {
    query.is_active = true;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (subcategory) {
    query.subcategory = subcategory;
  }
  
  if (pricing_type) {
    query.pricing_type = pricing_type;
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = { [sort_by]: sortOrder };

  const skip = (page - 1) * limit;

  const items = await Item.find(query)
    .populate('category')
    .populate({
      path: 'subcategory',
      populate: { path: 'category' }
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Item.countDocuments(query);

  res.json({
    success: true,
    data: items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('category')
    .populate({
      path: 'subcategory',
      populate: { path: 'category' }
    });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  res.json({
    success: true,
    data: item
  });
});

export const getItemPrice = asyncHandler(async (req, res) => {
  const { quantity, time, addons } = req.query;
  
  const item = await Item.findById(req.params.id)
    .populate('category')
    .populate({
      path: 'subcategory',
      populate: { path: 'category' }
    });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  const options = {
    quantity: quantity ? parseInt(quantity) : 1,
    time: time ? new Date(time) : new Date(),
    selectedAddons: addons ? JSON.parse(addons) : []
  };

  const priceDetails = pricingService.calculatePrice(item, options);

  res.json({
    success: true,
    item: {
      id: item._id,
      name: item.name
    },
    ...priceDetails
  });
});

export const searchItems = asyncHandler(async (req, res) => {
  const {
    q,
    min_price,
    max_price,
    category,
    active_only,
    tax_applicable,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  if (active_only === 'true') {
    query.is_active = true;
  }

  if (category) {
    query.category = category;
  }

  if (tax_applicable !== undefined) {
    query.tax_applicable = tax_applicable === 'true';
  }

  const skip = (page - 1) * limit;

  let items = await Item.find(query)
    .populate('category')
    .populate({
      path: 'subcategory',
      populate: { path: 'category' }
    })
    .skip(skip)
    .limit(parseInt(limit));

  if (min_price || max_price) {
    items = items.filter(item => {
      try {
        const pricing = pricingService.calculatePrice(item);
        const price = pricing.base_price;
        
        if (min_price && price < parseFloat(min_price)) return false;
        if (max_price && price > parseFloat(max_price)) return false;
        
        return true;
      } catch (error) {
        return true;
      }
    });
  }

  const total = items.length;

  res.json({
    success: true,
    data: items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  res.json({
    success: true,
    data: item
  });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Item not found'
    });
  }

  res.json({
    success: true,
    message: 'Item deactivated successfully',
    data: item
  });
});