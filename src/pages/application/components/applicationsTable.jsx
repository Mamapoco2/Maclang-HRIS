import { Card, CardContent } from "@/components/ui/card";

export function ApplicantsTable({ applicants }) {
  const renderDocuments = (documents) => {
    if (!documents) return "—";

    const docList = documents
      .split(",")
      .map((doc) => doc.trim())
      .filter((doc) => doc.length > 0);

    return (
      <ul className="list-disc list-inside">
        {docList.map((doc, index) => (
          <li key={index}>{doc}</li>
        ))}
      </ul>
    );
  };

  return (
    <Card>
      <CardContent>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Source</th>
              <th className="p-2">Documents</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  {a.firstName} {a.lastName}
                </td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.source}</td>
                <td className="p-2">{renderDocuments(a.documents)}</td>
                <td className="p-2">
                  <span className="text-green-600 font-medium">
                    For Interview
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
