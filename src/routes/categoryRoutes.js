import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { validateCategory } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', validateCategory, categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', validateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;