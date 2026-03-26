import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import TeamTableRow from "./TeamTableRow";

export default function DepartmentTeamCard({ group }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className="shadow-sm rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none bg-muted/40 hover:bg-muted/60 transition-colors border-b"
        onClick={() => setCollapsed((p) => !p)}
      >
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm">{group.name}</span>
          <span className="text-xs text-muted-foreground font-normal">
            ({group.members.length}{" "}
            {group.members.length === 1 ? "member" : "members"})
          </span>
        </div>
        {collapsed ? (
          <ChevronDown size={14} className="text-muted-foreground" />
        ) : (
          <ChevronUp size={14} className="text-muted-foreground" />
        )}
      </div>

      {!collapsed && (
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[10px] uppercase tracking-widest text-slate-400 py-2 text-center">
                  Name
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-slate-400 py-2 text-center">
                  Role
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-slate-400 py-2 text-center">
                  Division
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-slate-400 py-2 text-center">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-slate-400 py-2 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.members.map((member) => (
                <TeamTableRow key={member.id} member={member} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
