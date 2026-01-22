import express from 'express';
import * as subcategoryController from '../controllers/subcategoryController.js';
import { validateSubcategory } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', validateSubcategory, subcategoryController.createSubcategory);
router.get('/', subcategoryController.getSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);
router.put('/:id', validateSubcategory, subcategoryController.updateSubcategory);
router.delete('/:id', subcategoryController.deleteSubcategory);

export default router;