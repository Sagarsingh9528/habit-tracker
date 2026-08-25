import { PrismaClient } from '@prisma/client';
import { calculateStreaks, isCompletedToday } from '../utils/streaks.js';

const prisma = new PrismaClient();

export async function createHabit(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Habit name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ 
        error: 'Habit name must be 100 characters or less' 
      });
    }

    
    const habit = await prisma.habit.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId
      },
      include: {
        checkIns: true
      }
    });

    res.status(201).json({
      message: 'Habit created successfully',
      habit: {
        ...habit,
        currentStreak: 0,
        longestStreak: 0,
        completedToday: false
      }
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
}

export async function getHabits(req, res) {
  try {
    const userId = req.user.id;
    const userTimezone = req.user.timezone;

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        checkIns: {
          orderBy: { localDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    
    const habitsWithStreaks = habits.map(habit => {
      const { currentStreak, longestStreak } = calculateStreaks(
        habit.checkIns,
        userTimezone
      );
      const completedToday = isCompletedToday(habit.checkIns, userTimezone);

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
        currentStreak,
        longestStreak,
        completedToday,
        totalCheckIns: habit.checkIns.length
      };
    });

    res.json({ habits: habitsWithStreaks });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
}

export async function getHabit(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userTimezone = req.user.timezone;

    const habit = await prisma.habit.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        checkIns: {
          orderBy: { localDate: 'desc' }
        }
      }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const { currentStreak, longestStreak } = calculateStreaks(
      habit.checkIns,
      userTimezone
    );
    const completedToday = isCompletedToday(habit.checkIns, userTimezone);

    res.json({
      habit: {
        ...habit,
        currentStreak,
        longestStreak,
        completedToday
      }
    });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
}

export async function updateHabit(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Habit name cannot be empty' });
    }

    if (name && name.length > 100) {
      return res.status(400).json({ 
        error: 'Habit name must be 100 characters or less' 
      });
    }

    
    const existingHabit = await prisma.habit.findFirst({
      where: { id, userId }
    });

    if (!existingHabit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

   
    const habit = await prisma.habit.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null })
      },
      include: {
        checkIns: true
      }
    });

    const { currentStreak, longestStreak } = calculateStreaks(
      habit.checkIns,
      req.user.timezone
    );
    const completedToday = isCompletedToday(habit.checkIns, req.user.timezone);

    res.json({
      message: 'Habit updated successfully',
      habit: {
        ...habit,
        currentStreak,
        longestStreak,
        completedToday
      }
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Failed to update habit' });
  }
}

export async function deleteHabit(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

   
    const habit = await prisma.habit.findFirst({
      where: { id, userId }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    
    await prisma.habit.delete({
      where: { id }
    });

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
}
