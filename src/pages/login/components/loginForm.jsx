// src/pages/login/components/loginForm.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { AuthContext } from "@/context/authContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useContext, useState, useRef, useEffect } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFirstAccessibleRoute } from "@/hooks/useFirstAccessibleRoute";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export default function LoginForm() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const firstAccessibleRoute = useFirstAccessibleRoute();
  const [serverError, setServerError] = useState("");
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginSucceeded, setLoginSucceeded] = useState(false);
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

  useEffect(() => {
    if (loginSucceeded && isAuthenticated) {
      navigate(firstAccessibleRoute, { replace: true });
    }
  }, [loginSucceeded, isAuthenticated, navigate, firstAccessibleRoute]);

  const onSubmit = async (data) => {
    if (isLockedOut) return;

    setServerError("");

    const res = await login(data.username, data.password);

    if (res.success) {
      attempts.current = 0;
      setLoginSucceeded(true);
    } else {
      attempts.current += 1;

      if (attempts.current >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_MS);
        attempts.current = 0;
        setServerError("Too many attempts. Try again in 60 seconds.");
      } else {
        setServerError(res.error || "Invalid username or password.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Server / lockout error */}
      {serverError && (
        <p
          role="alert"
          className="rounded-md border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-3 py-2 text-sm text-[#8A5A12]"
        >
          {serverError}
        </p>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <Label
          htmlFor="username"
          className="text-xs font-medium uppercase tracking-wide text-[#5A7188]"
        >
          Username<span className="text-[#E8A33D]">*</span>
        </Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          className="h-11 rounded-lg border-[#D7E0E8] bg-white text-[#16324A] placeholder:text-[#9BAAB8] focus-visible:border-[#6FA3D8] focus-visible:ring-[#6FA3D8]/30"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-xs text-[#C2410C]">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-wide text-[#5A7188]"
        >
          Password<span className="text-[#E8A33D]">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••••••••"
            className="h-11 rounded-lg border-[#D7E0E8] bg-white pr-10 text-[#16324A] placeholder:text-[#9BAAB8] focus-visible:border-[#6FA3D8] focus-visible:ring-[#6FA3D8]/30"
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute inset-y-0 right-0 rounded-l-none text-[#7C93A8] hover:bg-transparent hover:text-[#16324A]"
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
          <p className="text-xs text-[#C2410C]">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="rememberMe"
          className="size-4 border-[#B7C5D2] data-[state=checked]:border-[#6FA3D8] data-[state=checked]:bg-[#6FA3D8]"
        />
        <Label
          htmlFor="rememberMe"
          className="text-sm font-normal text-[#5A7188]"
        >
          Remember me
        </Label>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || isLockedOut}
        className="h-11 w-full rounded-lg bg-[#16324A] text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#16324A]/90 disabled:opacity-60"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <IconLoader2 size={18} className="animate-spin" />
            Signing in…
          </span>
        ) : isLockedOut ? (
          `Try again in ${lockoutSeconds}s`
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
