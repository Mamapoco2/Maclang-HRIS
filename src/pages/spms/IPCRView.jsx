import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

export default function IPCRView() {
  const targets = [
    {
      mfo: "Personnel Services",
      indicator: "100% Staffing",
      q: 4,
      e: 4,
      t: 5,
      avg: 4.33,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">IPCR View</h1>

      <Card>
        <CardContent className="p-6">
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
                  <TableCell className="text-center font-semibold">
                    {t.avg}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}