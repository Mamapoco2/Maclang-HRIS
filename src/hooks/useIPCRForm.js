// hooks/useIPCRForm.js
import { useState, useEffect } from "react";
import { useIPCRRating } from "./useIPCRRating";

const EMPTY_ROW = {
  output: "",
  indicators: "",
  accomplishments: "",
  q: "",
  e: "",
  t: "",
  a: "",
  remarks: "",
};

const DEFAULT_EMPLOYEE_INFO = {
  name: "",
  position: "",
  unit: "",
  department: "Rosario Maclang Bautista General Hospital",
  period: "January to June 2026",
};

const DEFAULT_CORE_FUNCTIONS = [
  { id: "c1", ...EMPTY_ROW },
  { id: "c2", ...EMPTY_ROW },
  { id: "c3", ...EMPTY_ROW },
];

const DEFAULT_SUPPORT_FUNCTIONS = [
  { id: "s1", ...EMPTY_ROW },
  { id: "s2", ...EMPTY_ROW },
];

export const useIPCRForm = (initialId = null) => {
  const [employeeInfo, setEmployeeInfo] = useState(DEFAULT_EMPLOYEE_INFO);
  const [coreFunctions, setCoreFunctions] = useState(DEFAULT_CORE_FUNCTIONS);
  const [supportFunctions, setSupportFunctions] = useState(
    DEFAULT_SUPPORT_FUNCTIONS,
  );

  useEffect(() => {
    if (initialId) {
      // console.log("Load IPCR:", initialId);
    }
  }, [initialId]);

  const updateRowWithComputation = (type, rowId, field, value) => {
    const setter = type === "core" ? setCoreFunctions : setSupportFunctions;

    setter((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        const updated = { ...row, [field]: value };
        if (["q", "e", "t"].includes(field)) {
          const { average } = useIPCRRating(updated.q, updated.e, updated.t);
          updated.a = average;
        }
        return updated;
      }),
    );
  };

  const updateRow = (type, rowId, field, value) => {
    const setter = type === "core" ? setCoreFunctions : setSupportFunctions;
    setter((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = (type) => {
    const newRow = {
      id: generateRowId(),
      ...EMPTY_ROW,
    };

    if (type === "core") {
      setCoreFunctions([...coreFunctions, newRow]);
    } else {
      setSupportFunctions([...supportFunctions, newRow]);
    }
  };

  const removeRow = (type, rowId) => {
    const setter = type === "core" ? setCoreFunctions : setSupportFunctions;
    setter((prev) => prev.filter((row) => row.id !== rowId));
  };

  const calculatePartRatings = () => {
    const coreScores = coreFunctions
      .map((r) => parseFloat(r.a))
      .filter((v) => !isNaN(v));

    const supportScores = supportFunctions
      .map((r) => parseFloat(r.a))
      .filter((v) => !isNaN(v));

    const coreAvg =
      coreScores.length > 0
        ? coreScores.reduce((a, b) => a + b, 0) / coreScores.length
        : 0;

    const supportAvg =
      supportScores.length > 0
        ? supportScores.reduce((a, b) => a + b, 0) / supportScores.length
        : 0;

    return {
      coreAverage: coreAvg,
      supportAverage: supportAvg,
      part1: (coreAvg * 0.7).toFixed(2),
      part2: (supportAvg * 0.3).toFixed(2),
      totalRating: (coreAvg * 0.7 + supportAvg * 0.3).toFixed(2),
    };
  };

  const getSubmitPayload = () => {
    const ratings = calculatePartRatings();
    return {
      employeeInfo,
      coreFunctions,
      supportFunctions,
      ...ratings,
    };
  };

  return {
    employeeInfo,
    coreFunctions,
    supportFunctions,

    setEmployeeInfo,

    updateRow,
    updateRowWithComputation,
    addRow,
    removeRow,

    ...calculatePartRatings(),

    getSubmitPayload,
  };
};

export const generateRowId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export { EMPTY_ROW, DEFAULT_EMPLOYEE_INFO };
