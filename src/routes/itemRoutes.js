import express from 'express';
import * as itemController from '../controllers/itemController.js';
import * as bookingController from '../controllers/bookingController.js';
import { validateItem } from '../middlewares/validation.js';

const router = express.Router();

router.get('/search', itemController.searchItems);
router.post('/', validateItem, itemController.createItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.get('/:id/price', itemController.getItemPrice);
router.get('/:id/availability', bookingController.checkAvailability);
router.put('/:id', validateItem, itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;