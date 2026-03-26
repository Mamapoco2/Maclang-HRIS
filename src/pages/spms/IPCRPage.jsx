import { Badge } from "@/components/ui/badge"
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
import { Link } from "react-router-dom"

export default function IPCRPage() {

  const ipcrs = [
    { id: 1, name: "Juan Dela Cruz", status: "Draft" },
    { id: 2, name: "Maria Santos", status: "Rated" },
  ]

  const getStatusVariant = (status) => {
    switch (status) {
      case "Draft":
        return "secondary"
      case "Submitted":
        return "default"
      case "Rated":
        return "outline"
      case "Approved":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            IPCR List
          </h1>
          <p className="text-sm text-muted-foreground">
            Individual Performance Commitment and Review
          </p>
        </div>

        <Link to="/spms/ipcr/IPCRForm">
          <Button>
            Create IPCR
          </Button>
        </Link>
      </div>

      {/* TABLE CARD */}
      <Card className="shadow-sm border">
        <CardContent className="p-0">

          <div className="overflow-x-auto">

            <Table>

              {/* HEADER */}
              <TableHeader>
                <TableRow className="bg-muted/40">

                  <TableHead className="w-[60px] text-center">
                    #
                  </TableHead>

                  <TableHead>
                    Employee
                  </TableHead>

                  <TableHead className="text-center w-[150px]">
                    Status
                  </TableHead>

                  <TableHead className="text-right w-[260px] pr-6">
                    Actions
                  </TableHead>

                </TableRow>
              </TableHeader>

              {/* BODY */}
              <TableBody>

                {ipcrs.length === 0 ? (

                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No IPCR records found
                    </TableCell>
                  </TableRow>

                ) : (

                  ipcrs.map((ipcr, index) => (

                    <TableRow
                      key={ipcr.id}
                      className="hover:bg-muted/30 transition"
                    >

                      {/* NUMBER */}
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* EMPLOYEE */}
                      <TableCell className="font-medium">
                        {ipcr.name}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(ipcr.status)}>
                          {ipcr.status}
                        </Badge>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">

                          <Link to={`/spms/ipcr/${ipcr.id}/edit`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>

                          <Link to={`/spms/ipcr/${ipcr.id}/view`}>
                            <Button size="sm" variant="secondary">
                              View
                            </Button>
                          </Link>

                          <Link to={`/spms/ipcr/${ipcr.id}/rate`}>
                            <Button size="sm">
                              Rate
                            </Button>
                          </Link>

                        </div>
                      </TableCell>

                    </TableRow>

                  ))

                )}

              </TableBody>

            </Table>

          </div>

        </CardContent>
      </Card>

    </div>
  )
}