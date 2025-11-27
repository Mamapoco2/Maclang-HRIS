import { useMemo } from "react";
import { Members } from "../../../services/teamMemberServices";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";

import TeamTableHeader from "./TeamTableHeader";
import TeamTableRow from "./TeamTableRow";

export default function TeamTable() {
  const data = useMemo(() => Members, []);

  return (
    <div className="w-full flex py-10 px-4">
      <Card className="w-full shadow-md rounded-2xl">
        <CardHeader>
          <TeamTableHeader />
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
              {data.map((member) => (
                <TeamTableRow key={member.id} member={member} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
