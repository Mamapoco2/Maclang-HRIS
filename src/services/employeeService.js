import axios from "axios";

let employees = [
  {
    id: 1,
    avatar: "https://randomuser.me/api/portraits/women/13.jpg",
    firstName: "Maria",
    lastName: "Santos",
    middleName: "Dela Cruz",
    suffix: "III",
    email: "juan@example.com",
    contact: "09123456789",
    position: "HR Manager",
    department: "Human Resources",
    gender: "Male",
    status: "Active",
    address: "Quezon City",
    birthdate: "1992-05-10",
    salary: 45000,
    employeeType: "Full-time",
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
