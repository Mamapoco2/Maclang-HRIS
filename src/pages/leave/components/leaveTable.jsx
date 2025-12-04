import React, { useState } from "react";

export default function LeaveTable() {
  const [requests, setRequests] = useState([
    { id: 1, name: "John Doe", reason: "Medical leave", status: "pending" },
    {
      id: 2,
      name: "Jane Smith",
      reason: "Family emergency",
      status: "accepted",
    },
    { id: 3, name: "Mark Lee", reason: "Vacation", status: "rejected" },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock leave history data for each employee
  const leaveHistory = {
    1: [
      {
        date: "2024-11-15",
        reason: "Medical leave",
        status: "accepted",
        days: 3,
      },
      { date: "2024-10-05", reason: "Sick leave", status: "accepted", days: 2 },
      { date: "2024-09-20", reason: "Personal", status: "rejected", days: 1 },
    ],
    2: [
      {
        date: "2024-11-20",
        reason: "Family emergency",
        status: "pending",
        days: 5,
      },
      { date: "2024-08-12", reason: "Vacation", status: "accepted", days: 7 },
      { date: "2024-06-03", reason: "Medical", status: "accepted", days: 2 },
    ],
    3: [
      { date: "2024-12-01", reason: "Vacation", status: "pending", days: 10 },
      { date: "2024-07-15", reason: "Personal", status: "accepted", days: 3 },
      { date: "2024-05-22", reason: "Sick leave", status: "accepted", days: 1 },
    ],
  };

  const updateStatus = (id, newStatus, e) => {
    e.stopPropagation();
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  const openModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                Employee
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                Reason
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr
                key={req.id}
                onClick={() => openModal(req)}
                className="hover:bg-gray-50 cursor-pointer transition"
              >
                <td className="px-6 py-4 text-sm">{req.name}</td>
                <td className="px-6 py-4 text-sm">{req.reason}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      req.status === "pending"
                        ? "bg-orange-100 text-orange-700"
                        : req.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => updateStatus(req.id, "accepted", e)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => updateStatus(req.id, "rejected", e)}
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedEmployee && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Leave Details</h2>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="px-6 py-4 overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">
                {selectedEmployee.name}'s Leave History
              </h3>

              <div className="space-y-4">
                {leaveHistory[selectedEmployee.id]?.map((leave, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{leave.reason}</p>
                        <p className="text-xs text-gray-500">{leave.date}</p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          leave.status === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : leave.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Duration: {leave.days} day{leave.days > 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
