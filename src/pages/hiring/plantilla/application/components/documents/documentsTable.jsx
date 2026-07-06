import React, { useMemo, useState } from "react";
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
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconDownload,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import api from "@/api/api";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { candidateName } from "../psbUtils";

function formatDocKey(key) {
  return key.replace(/_/g, " ").toUpperCase();
}

function getMissingRequiredDocs(application) {
  const required = application.posting?.required_documents ?? {};
  const requiredKeys = Object.entries(required)
    .filter(([, isRequired]) => isRequired)
    .map(([key]) => key);

  const submittedKeys = (application.documents ?? []).map(
    (d) => d.document_key,
  );

  return requiredKeys.filter((key) => !submittedKeys.includes(key));
}

function completenessRank(application) {
  const documents = application.documents ?? [];
  if (documents.length === 0) return 0;
  if (getMissingRequiredDocs(application).length > 0) return 1;
  return 2;
}

export default function DocumentsTable({ applications }) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  const sortedApplications = useMemo(() => {
    return [...applications].sort(
      (a, b) => completenessRank(a) - completenessRank(b),
    );
  }, [applications]);

  const toggleRow = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(
        plantillaPostingService.documentDownloadUrl(doc.id),
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(
        err?.response?.status === 403
          ? "NOT AUTHORIZED TO DOWNLOAD THIS FILE."
          : "FAILED TO DOWNLOAD FILE.",
      );
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-10" />
              <TableHead>CANDIDATE</TableHead>
              <TableHead>ITEM NO.</TableHead>
              <TableHead>POSITION</TableHead>
              <TableHead>DOCUMENTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  NO APPLICATIONS FOUND.
                </TableCell>
              </TableRow>
            ) : (
              sortedApplications.map((application) => {
                const documents = application.documents ?? [];
                const missingDocs = getMissingRequiredDocs(application);
                const hasNoDocsAtAll = documents.length === 0;
                const isIncomplete = missingDocs.length > 0;
                const isExpanded = expandedIds.has(application.id);

                const rowBg = hasNoDocsAtAll
                  ? "bg-red-50 hover:bg-red-100"
                  : isIncomplete
                    ? "bg-amber-50 hover:bg-amber-100"
                    : "hover:bg-gray-50";

                return (
                  <React.Fragment key={application.id}>
                    <TableRow
                      className={`cursor-pointer ${rowBg}`}
                      onClick={() =>
                        documents.length > 0 && toggleRow(application.id)
                      }
                    >
                      <TableCell>
                        {documents.length > 0 &&
                          (isExpanded ? (
                            <IconChevronDown
                              size={16}
                              className="text-gray-400"
                            />
                          ) : (
                            <IconChevronRight
                              size={16}
                              className="text-gray-400"
                            />
                          ))}
                      </TableCell>
                      <TableCell className="font-medium uppercase">
                        {candidateName(application.employee)}
                      </TableCell>
                      <TableCell className="uppercase">
                        {application.posting?.base_item_number ?? "—"}
                      </TableCell>
                      <TableCell className="uppercase">
                        {application.posting?.title ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {documents.length > 0 ? (
                            <span className="text-xs text-gray-600">
                              {documents.length} DOC
                              {documents.length > 1 ? "S" : ""}
                            </span>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              NONE
                            </span>
                          )}
                          {(hasNoDocsAtAll || isIncomplete) && (
                            <span
                              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                hasNoDocsAtAll
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              <IconAlertTriangle size={11} />
                              {hasNoDocsAtAll
                                ? "NO DOCUMENTS"
                                : `MISSING ${missingDocs.length}`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && documents.length > 0 && (
                      <TableRow className={rowBg}>
                        <TableCell />
                        <TableCell colSpan={4} className="py-2">
                          <div className="space-y-1">
                            {documents.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(doc);
                                }}
                                className="flex w-full max-w-md items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-white"
                              >
                                <IconFileText
                                  size={13}
                                  className="shrink-0 text-gray-400"
                                />
                                <span className="text-gray-500">
                                  {formatDocKey(doc.document_key)}:
                                </span>
                                <span className="truncate">
                                  {doc.original_filename}
                                </span>
                                <IconDownload
                                  size={13}
                                  className="ml-auto shrink-0 text-gray-400"
                                />
                              </button>
                            ))}
                            {missingDocs.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-amber-200 pt-2">
                                <span className="text-[10px] font-medium uppercase text-amber-700">
                                  Missing:
                                </span>
                                {missingDocs.map((key) => (
                                  <span
                                    key={key}
                                    className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                                  >
                                    {formatDocKey(key)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
