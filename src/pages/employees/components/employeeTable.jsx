import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";

export default function EmployeeTable({ employees, onEdit, onDelete, onView }) {
  const [search, setSearch] = useState("");

  const filteredEmployees = employees.filter((emp) =>
    emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
    emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
    emp.middleName.toLowerCase().includes(search.toLowerCase()) ||
    emp.suffixName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4">
        <Input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Last Name</TableHead>
            <TableHead className="text-left">First Name</TableHead>
            <TableHead className="text-left">Middle Name</TableHead>
            <TableHead className="text-left">Suffix</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Position</TableHead>
            <TableHead className="text-left">Department</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.lastName}</TableCell>
                <TableCell>{emp.firstName}</TableCell>
                <TableCell>{emp.middleName}</TableCell>
                <TableCell>{emp.suffixName}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.position}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={emp.status === "Active" ? "default" : "secondary"}
                    className="mx-auto"
                  >
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(emp)}
                    className="flex items-center gap-1"
                  >
                    <IconEye size={16} />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onEdit(emp)}
                    className="flex items-center gap-1"
                  >
                    <IconEdit size={16} />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(emp.id)}
                    className="flex items-center gap-1"
                  >
                    <IconTrash size={16} />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No employees found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
