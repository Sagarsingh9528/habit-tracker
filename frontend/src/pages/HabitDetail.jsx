import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BackfillModal from '../components/BackfillModal';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBackfillModal, setShowBackfillModal] = useState(false);

  const fetchHabit = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/habits/${id}`);
      setHabit(response.data.habit);
      setError('');
    } catch (err) {
      setError('Failed to load habit details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabit();
  }, [id]);

  const handleCheckIn = async () => {
    try {
      await api.post(`/habits/${id}/checkins`, {});
      await fetchHabit();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to check in';
      alert(errorMsg);
    }
  };

  const handleBackfillCheckIn = async (localDate) => {
    try {
      await api.post(`/habits/${id}/checkins`, { localDate });
      setShowBackfillModal(false);
      await fetchHabit();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to add check-in');
    }
  };

  const handleDeleteCheckIn = async (checkInId) => {
    if (!confirm('Are you sure you want to delete this check-in?')) {
      return;
    }

    try {
      await api.delete(`/checkins/${checkInId}`);
      await fetchHabit();
    } catch (err) {
      alert('Failed to delete check-in');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !habit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Habit not found'}</div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{habit.name}</h1>
          {habit.description && (
            <p className="text-gray-600 mt-1">{habit.description}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-4xl font-bold text-primary-600">
              {habit.currentStreak} 
            </div>
            <div className="text-xs text-gray-500 mt-1">consecutive days</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
            <div className="text-4xl font-bold text-orange-600">
              {habit.longestStreak} 
            </div>
            <div className="text-xs text-gray-500 mt-1">best performance</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Check-ins</div>
            <div className="text-4xl font-bold text-green-600">
              {habit.checkIns.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">all time</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleCheckIn}
            className={`btn ${habit.completedToday ? 'btn-secondary' : 'btn-success'}`}
            disabled={habit.completedToday}
          >
            {habit.completedToday ? '✓ Completed Today' : '✓ Check In for Today'}
          </button>
          <button
            onClick={() => setShowBackfillModal(true)}
            className="btn btn-primary"
          >
            📅 Add Past Check-in
          </button>
        </div>

        {/* Check-in History */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Check-in History</h2>
          
          {habit.checkIns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No check-ins yet. Start building your streak!
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {habit.checkIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatDate(checkIn.localDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Recorded at {formatTime(checkIn.checkedInAt, user.timezone)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCheckIn(checkIn.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Backfill Modal */}
      {showBackfillModal && (
        <BackfillModal
          habitCreatedAt={habit.createdAt}
          existingDates={habit.checkIns.map(c => c.localDate)}
          onClose={() => setShowBackfillModal(false)}
          onSubmit={handleBackfillCheckIn}
        />
      )}
    </div>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(isoString, timezone) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
