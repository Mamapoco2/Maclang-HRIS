import React, { useState } from "react";
import ContractGenerationTab from "./components/contractGenerationTab";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  IconUserPlus,
  IconClipboardList,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";

export default function OnboardingPage() {
  const [search, setSearch] = useState("");

  const onboardingEmployees = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      position: "Software Developer",
      department: "IT Department",
      status: "Pending",
      startDate: "2026-03-10",
    },
    {
      id: 2,
      name: "Maria Santos",
      position: "HR Officer",
      department: "Human Resource",
      status: "In Progress",
      startDate: "2026-03-12",
    },
    {
      id: 3,
      name: "Pedro Reyes",
      position: "Accountant",
      department: "Finance",
      status: "Completed",
      startDate: "2026-03-05",
    },
  ];

  const filteredEmployees = onboardingEmployees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Pending":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Employee Onboarding
        </h1>
        <p className="text-muted-foreground">
          Manage and track onboarding progress of new employees.
        </p>
      </div>

      {/* TABS */}
      <Tabs defaultValue="onboarding">
        <TabsList>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>

          <TabsTrigger value="contracts">Contract Generation</TabsTrigger>
        </TabsList>

        {/* ONBOARDING TAB */}
        <TabsContent value="onboarding">
          {/* KPI CARDS */}
          <div className="grid gap-4 md:grid-cols-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">New Hires</CardTitle>
                <IconUserPlus size={18} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Employees awaiting onboarding
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">In Progress</CardTitle>
                <IconClipboardList size={18} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Onboarding currently ongoing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Completed</CardTitle>
                <IconCheck size={18} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Employees fully onboarded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Pending Tasks</CardTitle>
                <IconClock size={18} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  Tasks awaiting completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SEARCH */}
          <div className="flex items-center justify-between mt-6">
            <Input
              placeholder="Search employee..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button>Add New Hire</Button>
          </div>

          {/* TABLE */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Onboarding List</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.startDate}</TableCell>

                      <TableCell>
                        <Badge variant={statusColor(emp.status)}>
                          {emp.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>

                        <Button size="sm" variant="secondary">
                          Start
                        </Button>

                        <Button size="sm">Complete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTRACT TAB */}
        <TabsContent value="contracts">
          <ContractGenerationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
