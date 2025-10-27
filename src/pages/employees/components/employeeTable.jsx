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
    emp.fullName.toLowerCase().includes(search.toLowerCase())
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
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.fullName}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.position}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>
                  <Badge
                    variant={emp.status === "Active" ? "default" : "secondary"}
                  >
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(emp)}
                  >
                    <IconEye size={16} />
                    View
                  </Button>
                  <Button size="sm" onClick={() => onEdit(emp)}>
                    <IconEdit size={16} />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(emp.id)}
                  >
                    <IconTrash size={16} />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No employees found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
