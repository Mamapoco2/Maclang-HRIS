import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

export default function OPCRPage() {
  const data = [
    {
      mfo: "Personnel Services",
      target: "100% Staffing",
      budget: "₱1,000,000",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        OPCR - Office Performance
      </h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-muted-foreground">
            Department: HR Department
          </p>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MFO</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">
                    Budget
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.mfo}
                    </TableCell>
                    <TableCell>{item.target}</TableCell>
                    <TableCell className="text-right">
                      {item.budget}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button>Submit OPCR</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}