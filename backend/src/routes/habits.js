import express from 'express';
import { 
  createHabit, 
  getHabits, 
  getHabit, 
  updateHabit, 
  deleteHabit 
} from '../controllers/habitController.js';
import { createCheckIn, getCheckIns } from '../controllers/checkInController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();


router.use(authenticate);


router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:id', getHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

// Check-in routes (nested under habits)
router.post('/:id/checkins', createCheckIn);
router.get('/:id/checkins', getCheckIns);

export default router;
