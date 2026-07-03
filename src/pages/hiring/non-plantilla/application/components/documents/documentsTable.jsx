import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";
import { getApplicants, updateDocument } from "@/services/hiringService";
import { toast } from "sonner";

const DOC_STATUS = ["PENDING", "SUBMITTED", "APPROVED", "REJECTED"];

const STATUS_COLORS = {
  SUBMITTED: "bg-blue-50 text-blue-700",
  APPROVED: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function DocumentsTable() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getApplicants({ per_page: 100 });
    setApplicants(res.data ?? []);
    setLoading(false);
  };

  const handleStatusChange = async (applicantId, docId, status) => {
    try {
      await updateDocument(applicantId, docId, { status });
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicantId
            ? {
                ...a,
                documents: a.documents.map((d) =>
                  d.id === docId ? { ...d, status } : d,
                ),
              }
            : a,
        ),
      );
      toast.success("DOCUMENT STATUS UPDATED.");
    } catch {
      toast.error("FAILED TO UPDATE DOCUMENT STATUS.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <IconLoader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const rows = applicants.flatMap((a) =>
    (a.documents ?? []).map((doc) => ({
      ...doc,
      applicant_name: a.full_name,
      applicant_id: a.id,
    })),
  );

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>CANDIDATE</TableHead>
              <TableHead>DOCUMENT</TableHead>
              <TableHead>STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  NO DOCUMENTS FOUND.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium uppercase">
                    {doc.applicant_name}
                  </TableCell>
                  <TableCell className="uppercase">{doc.name}</TableCell>
                  <TableCell>
                    <Select
                      value={(doc.status ?? "").toUpperCase()}
                      onValueChange={(val) =>
                        handleStatusChange(doc.applicant_id, doc.id, val)
                      }
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[(doc.status ?? "").toUpperCase()] ?? ""}`}
                          >
                            {(doc.status ?? "").toUpperCase()}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_STATUS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
