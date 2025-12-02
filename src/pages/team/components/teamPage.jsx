import { useState } from "react";
import { Members } from "../../../services/teamMemberServices";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import TeamTableHeader from "./TeamTableHeader";
import TeamTableRow from "./TeamTableRow";

export default function TeamTable() {
  const [members, setMembers] = useState(Members);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpdate = (id, updatedData) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, ...updatedData } : m))
    );
  };

  const handleDelete = (id) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleAddMember = () => {
    console.log("Add member clicked");
  };

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase().trim();
    const firstName = member.firstName.toLowerCase();
    const lastName = member.lastName.toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const role = member.role.toLowerCase();
    const email = member.email.toLowerCase();

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      fullName.includes(query) ||
      role.includes(query) ||
      email.includes(query)
    );
  });

  return (
    <div className="w-full flex py-10 px-4">
      <Card className="w-full shadow-md rounded-2xl">
        <CardHeader>
          <TeamTableHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddMember={handleAddMember}
          />
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TeamTableRow
                    key={member.id}
                    member={member}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No team members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
