import React, { useState, useEffect } from "react"
import logo from "../images/rmbghlogo.png"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

// ✅ Zod Schema for validation
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())

  // ✅ Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ✅ React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  // ✅ Mock authentication
  const onSubmit = async (data) => {
    setErrorMessage("")
    if (data.username === "admin" && data.password === "admin123") {
      alert("✅ Login successful!")
    } else {
      setErrorMessage("Invalid username or password.")
    }
  }

  // ✅ Format time/date
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-blue-100 via-white to-blue-200
      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
      transition-all duration-700 relative overflow-hidden">

      {/* Soft floating gradient orbs for style */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-blue-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl"></div>

      {/* Date & Time */}
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

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="z-10"
      >
        <Card className="w-[380px] shadow-2xl backdrop-blur-lg bg-white/90 
          dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <CardHeader className="flex flex-col items-center space-y-3">
            <img
              src={logo}
              alt="RMBGH Logo"
              className="w-20 h-20 rounded-full border-4 border-blue-400 object-cover shadow-md"
            />
            <CardTitle className="text-center text-lg font-semibold text-gray-800 dark:text-gray-100">
              HRIS Portal
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...register("username")}
                  className="focus-visible:ring-blue-400"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="focus-visible:ring-blue-400"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {errorMessage && (
                <p className="text-sm text-center text-red-600">{errorMessage}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-2 bg-black hover:bg-gray-900 text-white font-medium transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <footer className="mt-6 text-xs text-gray-600 dark:text-gray-400 z-10">
        © {new Date().getFullYear()} RMBGH — All Rights Reserved
      </footer>
    </div>
  )
}

export default Login
