import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";

import { ViewMemberModal } from "./viewTeamModal";
import { EditMemberModal } from "./editTeamModal";
import { DeleteMemberModal } from "./deleteTeamModal";

export default function TeamTableRow({ member, onUpdate, onDelete }) {
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="flex items-center gap-3">
          <img
            src={member.avatar}
            alt={`${member.firstName} ${member.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          {member.firstName} {member.lastName}
        </TableCell>

        <TableCell>{member.role}</TableCell>
        <TableCell>{member.email}</TableCell>

        <TableCell className="text-right space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowView(true)}>
            <IconEye size={16} />
            View
          </Button>
          <Button size="sm" onClick={() => setShowEdit(true)}>
            <IconEdit size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDelete(true)}
          >
            <IconTrash size={16} />
            Delete
          </Button>
        </TableCell>
      </TableRow>

      <ViewMemberModal
        member={member}
        open={showView}
        onOpenChange={setShowView}
      />

      <EditMemberModal
        member={member}
        open={showEdit}
        onOpenChange={setShowEdit}
        onUpdate={onUpdate}
      />

      <DeleteMemberModal
        member={member}
        open={showDelete}
        onOpenChange={setShowDelete}
        onDelete={onDelete}
      />
    </>
  );
}
