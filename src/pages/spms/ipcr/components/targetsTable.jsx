import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function TargetsTable({ targets }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>MFO</TableHead>
          <TableHead>Success Indicator</TableHead>
          <TableHead className="text-center">Q</TableHead>
          <TableHead className="text-center">E</TableHead>
          <TableHead className="text-center">T</TableHead>
          <TableHead className="text-center">Avg</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {targets.map((t, i) => (
          <TableRow key={i}>
            <TableCell>{t.mfo}</TableCell>
            <TableCell>{t.indicator}</TableCell>
            <TableCell className="text-center">{t.q}</TableCell>
            <TableCell className="text-center">{t.e}</TableCell>
            <TableCell className="text-center">{t.t}</TableCell>
            <TableCell className="text-center font-semibold">{t.avg}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
