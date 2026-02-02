import { Dialog } from "primereact/dialog";

export default function DepartmentModal({ open, onClose, department, employees }) {
  return (
    <Dialog
      header={department ? `Department: ${department}` : "Department"}
      visible={open}
      onHide={onClose}
      style={{ width: "500px" }}
    >
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <>
          <p>Total Employees: {employees.length}</p>
          <ul className="list-disc list-inside max-h-64 overflow-auto">
            {employees.map((emp) => (
              <li key={emp.id}>{emp.name}</li>
            ))}
          </ul>
        </>
      )}
    </Dialog>
  );
}
