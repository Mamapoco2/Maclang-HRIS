// src/pages/login/components/LoginForm.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { AuthContext } from "@/context/authContext";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useContext, useState, useRef } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const attempts = useRef(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const isLockedOut = lockoutUntil && Date.now() < lockoutUntil;
  const lockoutSeconds = isLockedOut
    ? Math.ceil((lockoutUntil - Date.now()) / 1000)
    : 0;

  const onSubmit = async (data) => {
    if (isLockedOut) return;

    setServerError("");

    const res = await login(data.username, data.password);

    if (res.success) {
      attempts.current = 0;
      navigate("/dashboard", { replace: true });
    } else {
      attempts.current += 1;

      if (attempts.current >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_MS);
        attempts.current = 0;
        setServerError("TOO MANY ATTEMPTS. TRY AGAIN IN 60 SECONDS.");
      } else {
        setServerError(
          res.error ? res.error.toUpperCase() : "INVALID USERNAME OR PASSWORD.",
        );
      }
    }
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Server / lockout error */}
        {serverError && (
          <p
            role="alert"
            className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md uppercase"
          >
            {serverError}
          </p>
        )}

        {/* username */}
        <div className="space-y-1">
          <Label htmlFor="username" className="leading-5">
            Username<span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            className="uppercase"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-500 text-sm uppercase">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="w-full space-y-1">
          <Label htmlFor="password" className="leading-5">
            Password<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••••••"
              className="pr-9"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            >
              {isPasswordVisible ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
              <span className="sr-only">
                {isPasswordVisible ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm uppercase">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between gap-y-2">
          <div className="flex items-center gap-3">
            <Checkbox id="rememberMe" className="size-5" />
            <Label
              htmlFor="rememberMe"
              className="text-muted-foreground font-normal"
            >
              Remember Me
            </Label>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-black text-white uppercase"
          disabled={isSubmitting || isLockedOut}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <IconLoader2 size={20} stroke={1.5} className="animate-spin" />
              SIGNING IN...
            </div>
          ) : isLockedOut ? (
            `TRY AGAIN IN ${lockoutSeconds}S`
          ) : (
            "SIGN IN"
          )}
        </Button>
      </form>
    </CardContent>
  );
}
