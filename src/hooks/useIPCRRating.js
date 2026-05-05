// hooks/useIPCRRating.js
export const useIPCRRating = (q, e, t) => {
  const toNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  const values = [toNumber(q), toNumber(e), toNumber(t)].filter(
    (v) => v !== null
  );

  if (values.length === 0) return { average: "", isValid: false };

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return { average: avg.toFixed(2), isValid: true, raw: avg };
};

export const getAdjectival = (score) => {
  const s = parseFloat(score);
  if (s === 0) return "";
  if (s >= 4.5) return "Outstanding";
  if (s >= 3.5) return "Very Satisfactory";
  if (s >= 2.5) return "Satisfactory";
  if (s >= 1.5) return "Unsatisfactory";
  return "Poor";
};

export const computePartRatings = (functions) => {
  const validScores = functions
    .map((r) => parseFloat(r.a))
    .filter((v) => !isNaN(v) && v !== null);

  if (validScores.length === 0) return { average: 0, part: "0.00" };

  const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
  return { average: avg, part: avg.toFixed(2) };
};

export const generateRowId = () => Math.random().toString(36).substr(2, 9);

export const emptyRow = {
  output: "",
  indicators: "",
  accomplishments: "",
  q: "",
  e: "",
  t: "",
  a: "",
  remarks: "",
};
