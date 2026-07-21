import { useEffect, useState } from "react";
import { employeeService } from "@/services/employeeService";

/** Fetches the full divisions list once on mount, for the Division picker. */
export function useDivisions() {
  const [allDivisions, setAllDivisions] = useState([]);

  useEffect(() => {
    employeeService
      .getDivisions()
      .then((res) => setAllDivisions(res.data ?? res));
  }, []);

  return { allDivisions };
}
