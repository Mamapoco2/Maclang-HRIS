import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const documents = [
  {
    id: 1,
    candidate: "John Doe",
    name: "Resume",
    status: "Submitted",
  },
  {
    id: 2,
    candidate: "Jane Smith",
    name: "Cover Letter",
    status: "Pending",
  },
  {
    id: 3,
    candidate: "Michael Brown",
    name: "ID Proof",
    status: "Approved",
  },
];

export default function DocumentsTable() {
  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <tableHead>Candidate</tableHead>
              <TableHead>Document</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <tableCell className="font-medium">{doc.candidate}</tableCell>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>{doc.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
