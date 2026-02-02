import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function ApplicantsTable({ applicants }) {
  const renderDocuments = (documents) => {
    if (!documents) return "—";

    const docList = documents
      .split(",")
      .map((doc) => doc.trim())
      .filter((doc) => doc.length > 0);

    return (
      <ul className="list-disc list-inside">
        {docList.map((doc, index) => (
          <li key={index}>{doc}</li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <CardContent>
        <Table className="w-full text-left">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {applicants.map((a) => (
              <TableRow key={a.id} className="hover:bg-gray-50">
                <TableCell>
                  {a.firstName} {a.lastName}
                </TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{a.source}</TableCell>
                <TableCell>{a.contact}</TableCell>
                <TableCell>{a.department}</TableCell>
                <TableCell>{a.dateApplied}</TableCell>
                <TableCell>{a.submission}</TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">
                    For Interview
                  </span>
                </TableCell>
                <TableCell>{renderDocuments(a.documents)}</TableCell>
                <TableCell>{a.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
