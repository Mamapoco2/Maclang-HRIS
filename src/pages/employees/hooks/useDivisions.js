import { useEffect, useState } from "react";
import { employeeService } from "@/services/employeeService";

export function useDivisions() {
  const [allDivisions, setAllDivisions] = useState([]);

  useEffect(() => {
    employeeService
      .getDivisions()
      .then((res) => setAllDivisions(res.data ?? res));
  }, []);

  return { allDivisions };
}
