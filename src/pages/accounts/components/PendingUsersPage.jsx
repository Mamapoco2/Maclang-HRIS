import { useEffect, useState } from "react";
import { getUsers } from "@/services/accountsService";

export default function PendingUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    // getUsers() already returns res.data (the array), not the axios response
    const data = await getUsers();
    if (data) setUsers(data);
  };

  return (
    <div>
      <h2>Pending Users</h2>
      {users.map((u) => (
        <div key={u.id}>
          {u.name} - {u.email}
        </div>
      ))}
    </div>
  );
}
