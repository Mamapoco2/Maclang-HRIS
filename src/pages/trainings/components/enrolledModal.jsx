// src/pages/trainings/components/enrolledParticipantsModal.jsx
import React, { useState } from "react";
import { IconUsers } from "@tabler/icons-react";

export default function EnrolledParticipantsModal({ training, onClose }) {
  // avatar_url is already included in formatTraining() on the backend
  // no need to re-fetch each employee separately
  const participants = training?.participants ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Enrolled Participants
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
              {training?.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E0F4F4] text-[#0E6B6B] dark:bg-[#0E3D3D] dark:text-[#7DD6D6]">
              <IconUsers size={11} />
              {participants.length}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-3 max-h-80 overflow-y-auto">
          {participants.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">
              No participants enrolled yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {participants.map((p, i) => {
                const name = p.name || `Participant ${i + 1}`;
                const initials = name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <li
                    key={p.id ?? i}
                    className="flex items-center gap-3 py-2.5"
                  >
                    {/* avatar_url comes directly from formatTraining() */}
                    <AvatarWithFallback
                      src={p.avatar_url}
                      initials={initials}
                      name={name}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                        {name}
                      </p>
                      {p.employeeNumber && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                          {p.employeeNumber}
                        </p>
                      )}
                    </div>
                    {p.department && (
                      <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        {p.department}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar with initials fallback ─────────────────────────────────────────────
function AvatarWithFallback({ src, initials, name }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
      {initials}
    </div>
  );
}
