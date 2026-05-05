import {
  EditableCell,
  RatingInputsCell,
  FunctionRowActionCell,
} from "../formSection/formSections";

export function FunctionRow({
  row,
  type,
  onOutputChange,
  onIndicatorsChange,
  onAccomplishmentsChange,
  onQChange,
  onEChange,
  onTChange,
  onRemarksChange,
  onDelete,
}) {
  return (
    <tr className="group relative">
      <EditableCell value={row.output} onChange={onOutputChange} />
      <EditableCell value={row.indicators} onChange={onIndicatorsChange} />
      <EditableCell
        value={row.accomplishments}
        onChange={onAccomplishmentsChange}
      />
      <RatingInputsCell
        q={row.q}
        e={row.e}
        t={row.t}
        a={row.a}
        onQChange={onQChange}
        onEChange={onEChange}
        onTChange={onTChange}
      />
      <EditableCell value={row.remarks} onChange={onRemarksChange} />
      <FunctionRowActionCell onDelete={onDelete} />
    </tr>
  );
}
