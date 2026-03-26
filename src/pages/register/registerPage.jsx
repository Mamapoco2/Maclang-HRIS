// src/pages/register/components/registerPage.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../assets/rmbghlogo.png";
import RegisterForm from "./components/registerForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700 relative overflow-hidden">
      {/* background blobs — mirrors login page */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="z-10 border-2 border-blue-300/50 dark:border-blue-600/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src={logo}
            alt="RMBGH Logo"
            className="h-16 w-16 object-contain mb-3 drop-shadow"
          />
          <h1 className="text-xl font-semibold text-blue-800 dark:text-blue-300 tracking-wide">
            Create Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tracking-wider uppercase">
            Human Resource Information System
          </p>
        </div>

        {/* Form */}
        <RegisterForm />

        {/* Back to login */}
        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>

      {/* Footer */}
      <p className="mt-6 text-xs text-gray-400 dark:text-gray-600 z-10">
        © {new Date().getFullYear()} Rosario Maclang Bautista General Hospital
      </p>
    </div>
  );
}
