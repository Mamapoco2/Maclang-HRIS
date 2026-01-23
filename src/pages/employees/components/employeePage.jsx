import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { employeeService } from "@/services/employeeService";
import EmployeeTable from "./employeeTable";
import EmployeeForm from "./employeeForm";
import EmployeeDeleteDialog from "./employeeDeleteDialog";
import EmployeeViewDialog from "./employeeViewDialog";
import { toast } from "sonner";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);

  const loadEmployees = async () => {
    const data = await employeeService.getEmployees();
    setEmployees(data);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAdd = () => {
    setEditingEmployee(null);
    setOpenForm(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    setDeleteEmployeeId(id);
  };

  const handleView = (employee) => {
    setViewEmployee(employee);
  };

  const confirmDelete = async () => {
    await employeeService.deleteEmployee(deleteEmployeeId);
    toast.success("Employee deleted successfully");
    loadEmployees();
    setDeleteEmployeeId(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={handleAdd}>+ Add Employee</Button>
      </div>

      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="w-full max-w-[1400px] min-w-[1400px]">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            refresh={loadEmployees}
            onClose={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      <EmployeeDeleteDialog
        open={!!deleteEmployeeId}
        onClose={() => setDeleteEmployeeId(null)}
        onConfirm={confirmDelete}
      />

      <EmployeeViewDialog
        open={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        employee={viewEmployee}
      />
    </div>
  );
}
