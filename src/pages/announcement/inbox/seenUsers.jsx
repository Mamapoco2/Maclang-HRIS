import React, { useState } from 'react';

const dummySeenUsers = [
  { id: 1, name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=1', seenAt: '2025-11-04T12:00:00Z' },
  { id: 2, name: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?img=2', seenAt: '2025-11-04T12:05:00Z' },
  { id: 3, name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?img=3', seenAt: '2025-11-04T12:10:00Z' },
  // ...more users
];

const SeenUsers = ({ users = dummySeenUsers }) => {
  const [showAll, setShowAll] = useState(false);
  if (!users || users.length === 0) return null;

  const displayedUsers = showAll ? users : users.slice(0, 10);
  const remainingCount = users.length - displayedUsers.length;

  return (
    <div className="mt-4 flex items-center space-x-[-10px]">
      {displayedUsers.map(user => (
        <div key={user.id} className="relative group">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm cursor-pointer"
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {user.name} <br />
            {user.seenAt && <span className="text-gray-300 text-xs">{new Date(user.seenAt).toLocaleString()}</span>}
          </div>
        </div>
      ))}

      {!showAll && remainingCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-blue-600 font-medium hover:underline ml-2"
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
};

export default SeenUsers;
