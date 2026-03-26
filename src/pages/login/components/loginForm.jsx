// src/pages/login/components/LoginForm.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { AuthContext } from "@/context/authContext";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useContext, useState, useRef } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [lockoutUntil, setLockoutUntil] = useState(null);
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

    const res = await login(data.email, data.password);

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
          res.error ? res.error.toUpperCase() : "INVALID EMAIL OR PASSWORD.",
        );
      }
    }
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <p
            role="alert"
            className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md uppercase"
          >
            {serverError}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="uppercase">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder="EMAIL ADDRESS"
            className="uppercase placeholder:uppercase"
          />
          {errors.email && (
            <p className="text-red-500 text-sm uppercase">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="uppercase">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            placeholder="PASSWORD"
          />
          {errors.password && (
            <p className="text-red-500 text-sm uppercase">
              {errors.password.message}
            </p>
          )}
        </div>

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
