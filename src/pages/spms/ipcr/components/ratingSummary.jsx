export function RatingSummary({ label, value, colSpan = 4 }) {
  return (
    <tr>
      <td colSpan={colSpan} className="border border-black p-2 text-left">
        {label}
      </td>
      <td
        colSpan={2}
        className="border border-black p-2 text-center font-bold text-base"
      >
        {value}
      </td>
    </tr>
  );
}
