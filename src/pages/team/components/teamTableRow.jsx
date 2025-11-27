import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";

export default function TeamTableRow({ member }) {
  return (
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
        <Button variant="outline" size="sm" onClick={() => onView(emp)}>
          <IconEye size={16} />
          View
        </Button>
        <Button size="sm" onClick={() => onEdit(emp)}>
          <IconEdit size={16} />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(emp.id)}
        >
          <IconTrash size={16} />
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
