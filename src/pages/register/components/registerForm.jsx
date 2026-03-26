// src/pages/register/components/registerForm.jsx
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });

  const password = watch("password");

  const onSubmit = async (data) => {
    setServerError("");
    const res = await registerUser(
      data.email,
      data.password,
      data.password_confirmation,
    );
    if (res?.success) {
      navigate("/login");
    } else {
      setServerError(res?.error ?? "Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
        >
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="YOU@EXAMPLE.COM"
          autoComplete="email"
          className="bg-white/80 dark:bg-gray-800/80 uppercase placeholder:normal-case"
          {...register("email", {
            required: "Email is required.",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email address.",
            },
          })}
        />
        {errors.email && (
          <p className="text-xs text-red-500 uppercase tracking-wide">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            className="bg-white/80 dark:bg-gray-800/80 pr-10"
            {...register("password", {
              required: "Password is required.",
              minLength: { value: 8, message: "At least 8 characters." },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 uppercase tracking-wide">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password_confirmation"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
        >
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="password_confirmation"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            className="bg-white/80 dark:bg-gray-800/80 pr-10"
            {...register("password_confirmation", {
              required: "Please confirm your password.",
              validate: (val) => val === password || "Passwords do not match.",
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="text-xs text-red-500 uppercase tracking-wide">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 bg-blue-700 hover:bg-blue-600 text-white uppercase tracking-widest font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            CREATING ACCOUNT...
          </>
        ) : (
          "CREATE ACCOUNT"
        )}
      </Button>
    </form>
  );
}
