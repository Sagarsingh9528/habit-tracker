import express from 'express';
import { deleteCheckIn } from '../controllers/checkInController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();


router.use(authenticate);


router.delete('/:id', deleteCheckIn);

export default router;
