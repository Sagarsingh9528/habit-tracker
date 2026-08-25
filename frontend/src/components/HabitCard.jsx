export default function HabitCard({ habit, onCheckIn, onDelete, onViewDetails }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-600">{habit.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-gray-400 hover:text-red-600 text-xl"
          title="Delete habit"
        >
          ×
        </button>
      </div>

      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-primary-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            {habit.currentStreak}
          </div>
          <div className="text-xs text-gray-600">Current Streak</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {habit.longestStreak}
          </div>
          <div className="text-xs text-gray-600">Best Streak</div>
        </div>
      </div>

      
      {habit.completedToday ? (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
          <span className="text-green-700 font-medium text-sm">
            ✓ Completed Today
          </span>
        </div>
      ) : habit.currentStreak > 0 ? (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <span className="text-yellow-700 font-medium text-sm">
            Don't break the streak!
          </span>
        </div>
      ) : (
        <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <span className="text-gray-600 font-medium text-sm">
            Start your streak today
          </span>
        </div>
      )}

      
      <div className="flex gap-2">
        <button
          onClick={() => onCheckIn(habit.id)}
          className={`btn flex-1 ${
            habit.completedToday
              ? 'btn-secondary cursor-not-allowed'
              : 'btn-success'
          }`}
          disabled={habit.completedToday}
        >
          {habit.completedToday ? 'Done ✓' : 'Check In'}
        </button>
        <button
          onClick={onViewDetails}
          className="btn btn-secondary"
        >
          Details
        </button>
      </div>
    </div>
  );
}
