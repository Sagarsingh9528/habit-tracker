import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import HabitCard from '../components/HabitCard';
import CreateHabitModal from '../components/CreateHabitModal';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/habits');
      setHabits(response.data.habits);
      setError('');
    } catch (err) {
      setError('Failed to load habits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCheckIn = async (habitId) => {
    try {
      await api.post(`/habits/${habitId}/checkins`, {});
      // Refresh habits to update streaks
      await fetchHabits();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to check in';
      alert(errorMsg);
    }
  };

  const handleCreateHabit = async (name, description) => {
    try {
      await api.post('/habits', { name, description });
      setShowCreateModal(false);
      await fetchHabits();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create habit');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit? This will delete all check-ins.')) {
      return;
    }

    try {
      await api.delete(`/habits/${habitId}`);
      await fetchHabits();
    } catch (err) {
      alert('Failed to delete habit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                 Habit Tracker
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.email} • {user?.timezone}
              </p>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Habits</div>
            <div className="text-3xl font-bold text-primary-600">
              {habits.length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Completed Today</div>
            <div className="text-3xl font-bold text-green-600">
              {habits.filter(h => h.completedToday).length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Active Streaks</div>
            <div className="text-3xl font-bold text-orange-600">
              {habits.filter(h => h.currentStreak > 0).length}
            </div>
          </div>
        </div>

        
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            ➕ Create New Habit
          </button>
        </div>

       
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

       
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading habits...</div>
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No habits yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first habit to start building streaks!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onCheckIn={handleCheckIn}
                onDelete={handleDeleteHabit}
                onViewDetails={() => navigate(`/habits/${habit.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      
      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateHabit}
        />
      )}
    </div>
  );
}
