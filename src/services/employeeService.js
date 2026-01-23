import axios from "axios";

let employees = [
  {
    id: "RMBGH-023451",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    firstName: "Joshua",
    middleName: "Reyes",
    lastName: "Mendoza",
    suffix: null,
    email: "joshua.mendoza@company.com",
    contact: "09184567231",
    position: "Administrative Aide III",
    department: "Property and Supplies Department", // Current/Assigned Department
    designation: "Property and Supplies Department", // Original/Home Department
    gender: "Male",
    status: "Active",
    address: "San Fernando, Pampanga",
    birthdate: "1995-08-14",
    annualSalary: 222000,
    monthlySalary: 222000 / 12,
    sgLevel: 9,
    employeeType: "Plantilla",
    image: null,
  },
  {
    id: "RMBGH-019872",
    avatar: "https://randomuser.me/api/portraits/women/41.jpg",
    firstName: "Angela",
    middleName: "Santos",
    lastName: "Villanueva",
    suffix: null,
    email: "angela.villanueva@company.com",
    contact: "09273456198",
    position: "Nurse II",
    department: "Accounting Department", // Currently assigned here
    designation: "Dietary Department", // But originally from Dietary
    gender: "Female",
    status: "Active",
    address: "Angeles City, Pampanga",
    birthdate: "1993-02-22",
    annualSalary: 390000,
    monthlySalary: 390000 / 12,
    sgLevel: 13,
    employeeType: "Plantilla",
    image: null,
  },
];
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const employeeService = {
  getEmployees: () => {
    return Promise.resolve(employees);
  },

  addEmployee: (employee) => {
    const newEmployee = { ...employee, id: Date.now() };
    employees.push(newEmployee);
    return Promise.resolve(newEmployee);
  },

  updateEmployee: (id, updatedEmployee) => {
    employees = employees.map((emp) =>
      emp.id === id ? { ...emp, ...updatedEmployee } : emp
    );
    return Promise.resolve(updatedEmployee);
  },

  deleteEmployee: (id) => {
    employees = employees.filter((emp) => emp.id !== id);
    return Promise.resolve(true);
  },
};
