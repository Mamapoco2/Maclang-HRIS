import React from "react"
import logo from "../images/rmbghlogo.png" // <-- relative path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      {/* <header className="w-full bg-blue-200 dark:bg-gray-900 shadow-md flex items-center px-6 py-3">
        <img
          src={logo}
          alt="RMBGH Logo"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400">
          RMBGH-HRIS
        </h1>
      </header> */}

      {/* Main content: center the card */}
      <main className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <img
              src={logo}
              alt="RMBGH Logo"
              className="w-20 h-20 mb-3 rounded-full object-cover"
            />
            <CardTitle className="text-1xl font-semibold text-center">
              Human Resource Information System
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Username</Label>
                <Input id="email" type="text" placeholder="Enter your username" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" required />
              </div>

              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default Login
