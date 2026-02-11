import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react"; // Import Tabler icons
import TrainingAssignPeople from "../components/trainingPeopleAssign"; // Import the modal component

export default function TrainingTable({
  trainings = [],
  onSelect = () => {},
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onAssign = () => {},
}) {
  const [selectedTraining, setSelectedTraining] = useState(null); // Track the selected training
  const [isAssignModalOpen, setAssignModalOpen] = useState(false); // State for the modal visibility

  // Get the current status of the training based on the current date
  const getTrainingStatus = (training) => {
    const now = new Date();

    // Check if the training was cancelled
    if (training.status === "cancelled")
      return { label: "Cancelled", color: "text-red-600" };

    // If there's no start or end date, mark it as "Draft"
    if (!training.startDate || !training.endDate)
      return { label: "Draft", color: "text-muted-foreground" };

    // Get the start and end date of the training
    const start = new Date(training.startDate);
    const end = new Date(training.endDate);

    // Determine the current status based on the current time
    if (now < start) return { label: "Upcoming", color: "text-blue-600" };
    if (now >= start && now <= end)
      return { label: "Ongoing", color: "text-green-600" };
    if (now > end) return { label: "Finished", color: "text-gray-600" };

    return { label: "-", color: "" };
  };

  const handleAssignClick = (training) => {
    setSelectedTraining(training); // Set the selected training
    setAssignModalOpen(true); // Open the modal
  };

  return (
    <>
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Program</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Time & Date</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {trainings.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground"
              >
                No trainings added yet
              </TableCell>
            </TableRow>
          )}

          {trainings.map((t) => {
            const status = getTrainingStatus(t);

            return (
              <TableRow
                key={t.id}
                className="hover:bg-muted cursor-pointer"
                onClick={() => onSelect(t)}
              >
                <TableCell className="font-medium break-all whitespace-normal">
                  {t.title}
                </TableCell>
                <TableCell>{t.department || "-"}</TableCell>
                <TableCell>{t.category || "-"}</TableCell>
                <TableCell className="break-all whitespace-normal">
                  {t.eventAddress || "-"}
                </TableCell>

                {/* Time & Date */}
                <TableCell>
                  {t.startDate && t.endDate ? (
                    <>
                      <div>{new Date(t.startDate).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(t.startDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {new Date(t.endDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>

                {/* Mode of Training */}
                <TableCell className="capitalize">
                  {t.trainingMode || "-"}
                </TableCell>
                {/* Duration */}
                <TableCell>{t.duration || "-"}</TableCell>
                {/* Status */}
                <TableCell className={`font-medium ${status.color}`}>
                  {status.label}
                </TableCell>

                {/* ACTIONS */}
                <TableCell
                  className="text-right space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* View Icon */}
                  <button
                    title="View"
                    onClick={() => onView(t)}
                    className="p-2 text-gray-600 hover:text-blue-600 cursor-pointer"
                  >
                    <IconEye size={18} />
                  </button>

                  {/* Assign Icon */}
                  <button
                    title="Assign Participants"
                    onClick={() => handleAssignClick(t)} // Open the assign modal on click
                    className="p-2 text-gray-600 hover:text-indigo-600 cursor-pointer"
                  >
                    <IconUserPlus size={18} />
                  </button>

                  {/* Edit Icon */}
                  <button
                    title="Edit"
                    onClick={() => onEdit(t)}
                    className="p-2 text-gray-600 hover:text-green-600 cursor-pointer"
                  >
                    <IconEdit size={18} />
                  </button>

                  {/* Delete Icon */}
                  <button
                    title="Delete"
                    onClick={() => onDelete(t)} // Open delete modal on click
                    className="p-2 text-red-700 hover:text-red-400 cursor-pointer"
                  >
                    <IconTrash size={18} />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* TrainingAssignPeople Modal */}
      {selectedTraining && (
        <TrainingAssignPeople
          training={selectedTraining}
          open={isAssignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={onAssign}
        />
      )}
    </>
  );
}
