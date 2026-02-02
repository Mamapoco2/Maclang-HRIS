import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function TrainingTable({ trainings = [], onSelect = () => {} }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Program</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Enrollment</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {trainings.map((t) => (
          <TableRow
            key={t.id}
            className="cursor-pointer hover:bg-muted"
            onClick={() => onSelect(t)}
          >
            <TableCell className="font-medium">{t.title}</TableCell>
            <TableCell>{t.category || "All Departments"}</TableCell>
            <TableCell>Instructor</TableCell>
            <TableCell>{t.duration} hrs</TableCell>
            <TableCell>{t.participants?.length || 0}/30</TableCell>
            <TableCell className="capitalize">{t.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
