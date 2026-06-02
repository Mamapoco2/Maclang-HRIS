// src/pages/login/components/LoginPage.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import logo from "../../../assets/rmbghlogo.png";
import LoginForm from "./loginForm";
import LoginFooter from "./loginFooter";
import { useCurrentTime } from "./useLogin";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const { formattedDate, formattedTime } = useCurrentTime();

  return (
    <div className="relative flex h-auto min-h-screen flex-col items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Live clock */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 text-center"
      >
        <p className="text-gray-700 dark:text-gray-300 text-sm tracking-wide">
          {formattedDate}
        </p>
        <p className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
          {formattedTime}
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full sm:max-w-lg"
      >
        <Card className="w-full border border-blue-300/50 dark:border-blue-600/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-lg">
          {/* Header — items-center centers children horizontally */}
          <CardHeader className="flex flex-col items-center gap-4 text-center">
            <img src={logo} alt="Logo" className="h-15 w-auto object-contain" />

            <div>
              <CardTitle className="mb-1.5 text-2xl text-gray-900 dark:text-white">
                Sign in to your account
              </CardTitle>

              <CardDescription className="text-base">
                Welcome back — let's get you in.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-4">
              <LoginForm />

              {/* Register link */}
              <p className="text-muted-foreground text-center text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <LoginFooter />
    </div>
  );
}
