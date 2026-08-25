import { useState } from 'react';

export default function BackfillModal({ habitCreatedAt, existingDates, onClose, onSubmit }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const minDate = new Date(habitCreatedAt).toISOString().split('T')[0];
  
  
  const maxDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    // Check if date already has a check-in
    if (existingDates.includes(selectedDate)) {
      setError('You already have a check-in for this date');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedDate);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Add Past Check-in</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Backfill a check-in for a date you missed. This will recalculate your streaks.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can only add check-ins between when you created this habit and today
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
