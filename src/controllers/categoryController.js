import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Item from '../models/Item.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    data: category
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort_by = 'createdAt', order = 'desc', active_only } = req.query;
  
  const query = {};
  if (active_only === 'true') {
    query.is_active = true;
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = { [sort_by]: sortOrder };

  const skip = (page - 1) * limit;

  const categories = await Category.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Category.countDocuments(query);

  res.json({
    success: true,
    data: categories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const subcategories = await Subcategory.find({ category: category._id });
  const items = await Item.find({ category: category._id });

  res.json({
    success: true,
    data: {
      ...category.toObject(),
      subcategories,
      items
    }
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: category
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    message: 'Category deactivated successfully',
    data: category
  });
});