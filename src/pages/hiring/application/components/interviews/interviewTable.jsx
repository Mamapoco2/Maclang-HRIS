import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const interviews = [
  {
    id: 1,
    name: "John Doe",
    hr: "Completed",
    head: "Scheduled",
    final: "Pending",
    status: "In Progress",
  },
  {
    id: 2,
    name: "Jane Smith",
    hr: "Completed",
    head: "Completed",
    final: "Completed",
    status: "Selected",
  },
  {
    id: 3,
    name: "Michael Brown",
    hr: "Scheduled",
    head: "Pending",
    final: "Pending",
    status: "Pending",
  },
];

export default function InterviewTable() {
  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>HR</TableHead>
              <TableHead>Head</TableHead>
              <TableHead>Final</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="font-medium">{interview.name}</TableCell>
                <TableCell>{interview.hr}</TableCell>
                <TableCell>{interview.head}</TableCell>
                <TableCell>{interview.final}</TableCell>
                <TableCell>{interview.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
