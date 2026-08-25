import { PrismaClient, Prisma } from '@prisma/client';
import { 
  getLocalDate, 
  getCurrentLocalDate,
  isDateInFuture,
  isDateBeforeCreation,
  isValidLocalDateFormat
} from '../utils/timezone.js';

const prisma = new PrismaClient();

export async function createCheckIn(req, res) {
  try {
    const { id: habitId } = req.params;
    const { localDate } = req.body;
    const userId = req.user.id;
    const userTimezone = req.user.timezone;

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    let checkInLocalDate;
    
    if (localDate) {
      if (!isValidLocalDateFormat(localDate)) {
        return res.status(400).json({ 
          error: 'Invalid date format. Use YYYY-MM-DD' 
        });
      }

      if (isDateInFuture(localDate, userTimezone)) {
        return res.status(400).json({ 
          error: 'Cannot check in for future dates' 
        });
      }

      if (isDateBeforeCreation(localDate, habit.createdAt, userTimezone)) {
        return res.status(400).json({ 
          error: 'Cannot check in for dates before habit was created' 
        });
      }

      checkInLocalDate = localDate;
    } else {
      checkInLocalDate = getCurrentLocalDate(userTimezone);
    }

    try {
      const checkIn = await prisma.checkIn.create({
        data: {
          habitId,
          userId,
          localDate: checkInLocalDate,
          checkedInAt: new Date()
        }
      });

      res.status(201).json({
        message: 'Check-in recorded successfully',
        checkIn
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ 
          error: 'You have already checked in for this day' 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ error: 'Failed to create check-in' });
  }
}

export async function getCheckIns(req, res) {
  try {
    const { id: habitId } = req.params;
    const userId = req.user.id;

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { habitId },
      orderBy: { localDate: 'desc' }
    });

    res.json({ checkIns });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
}

export async function deleteCheckIn(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const checkIn = await prisma.checkIn.findFirst({
      where: { id, userId }
    });

    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    await prisma.checkIn.delete({
      where: { id }
    });

    res.json({ message: 'Check-in deleted successfully' });
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({ error: 'Failed to delete check-in' });
  }
}
