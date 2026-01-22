import Subcategory from '../models/Subcategory.js';
import Item from '../models/Item.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const createSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.create(req.body);
  
  const populated = await Subcategory.findById(subcategory._id).populate('category');
  
  res.status(201).json({
    success: true,
    data: populated
  });
});

export const getSubcategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort_by = 'createdAt', order = 'desc', category, active_only } = req.query;
  
  const query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (active_only === 'true') {
    query.is_active = true;
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = { [sort_by]: sortOrder };

  const skip = (page - 1) * limit;

  const subcategories = await Subcategory.find(query)
    .populate('category')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Subcategory.countDocuments(query);

  res.json({
    success: true,
    data: subcategories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getSubcategoryById = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id)
    .populate('category');

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  const items = await Item.find({ subcategory: subcategory._id });

  res.json({
    success: true,
    data: {
      ...subcategory.toObject(),
      items
    }
  });
});

export const updateSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('category');

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  res.json({
    success: true,
    data: subcategory
  });
});

export const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  res.json({
    success: true,
    message: 'Subcategory deactivated successfully',
    data: subcategory
  });
});