import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useDtrAuditLogs } from "@/hooks/useDtrAuditLogs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SCOPE_ACTIONS,
  actionLabel,
  actionTone,
  describeLog,
  formatWhen,
} from "./dtrAuditFormat";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const TONE_CLASS = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-700",
  destructive: "border-red-300 bg-red-50 text-red-700",
  neutral: "border-blue-300 bg-blue-50 text-blue-700",
};

function Details({ log }) {
  const { text, changes } = describeLog(log);

  if (text) return <span>{text}</span>;

  if (!changes.length) {
    return <span className="text-muted-foreground">No field changes</span>;
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {changes.map((change) => (
        <li key={change.field}>
          <span className="font-medium">{change.field}:</span>{" "}
          {"from" in change && (
            <span className="text-muted-foreground">{change.from}</span>
          )}
          {"from" in change && "to" in change && " \u2192 "}
          {"to" in change && <span>{change.to}</span>}
        </li>
      ))}
    </ul>
  );
}

function Actor({ actor, ipAddress }) {
  if (!actor) {
    return <span className="text-muted-foreground">Deleted user</span>;
  }

  return (
    <>
      <div className="font-medium">{actor.name ?? actor.username}</div>
      {actor.name && (
        <div className="text-xs text-muted-foreground">{actor.username}</div>
      )}
      {ipAddress && (
        <div className="text-xs text-muted-foreground">{ipAddress}</div>
      )}
    </>
  );
}

export default function DtrAuditLogSheet({
  open,
  onOpenChange,
  scope,
  title,
  description,
  searchPlaceholder,
}) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search.trim(), 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { rows, lastPage, total, loading, error, refetch } = useDtrAuditLogs({
    enabled: open,
    scope,
    action,
    q: debouncedSearch,
    from,
    to,
    page,
  });

  const actionOptions = SCOPE_ACTIONS[scope] ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-4xl"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4 pt-0">
          <div className="flex flex-wrap items-end gap-3 border-b pb-4">
            <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
              <Label htmlFor="dtr-audit-search">Search</Label>
              <Input
                id="dtr-audit-search"
                type="search"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent"
              />
            </div>
            <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
              <Label htmlFor="dtr-audit-action">Action</Label>
              <select
                id="dtr-audit-action"
                className={SELECT_CLASS}
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All actions</option>
                {actionOptions.map((value) => (
                  <option key={value} value={value}>
                    {actionLabel(value)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 max-md:flex-1">
              <Label htmlFor="dtr-audit-from">From</Label>
              <Input
                id="dtr-audit-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-1.5 max-md:flex-1">
              <Label htmlFor="dtr-audit-to">To</Label>
              <Input
                id="dtr-audit-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-md border border-red-300 px-4 py-3 text-sm text-red-600"
            >
              <span>{error}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refetch}
              >
                Retry
              </Button>
            </div>
          )}

          {loading && (
            <div className="py-4 text-muted-foreground">Loading audit log…</div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="py-4 text-muted-foreground">
              No audit entries found.
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <>
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="border-b-2 border-blue-600 hover:bg-transparent">
                    <TableHead className="text-blue-700">When</TableHead>
                    <TableHead className="text-blue-700">Who</TableHead>
                    <TableHead className="text-blue-700">Action</TableHead>
                    <TableHead className="text-blue-700">Subject</TableHead>
                    <TableHead className="text-blue-700">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap align-top text-sm">
                        {formatWhen(log.performed_at)}
                      </TableCell>
                      <TableCell className="align-top text-sm">
                        <Actor actor={log.actor} ipAddress={log.ip_address} />
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={TONE_CLASS[actionTone(log.action)]}
                        >
                          {actionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top text-sm">
                        {log.subject_label ?? "\u2014"}
                      </TableCell>
                      <TableCell className="whitespace-normal align-top text-sm">
                        <Details log={log} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {total} entr{total === 1 ? "y" : "ies"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="tabular-nums">
                    Page {page} of {lastPage}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}