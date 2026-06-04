import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Check, X, Clock } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v) => v?.length >= 8 },
  {
    id: "uppercase",
    label: "Contains uppercase letter",
    test: (v) => /[A-Z]/.test(v ?? ""),
  },
  {
    id: "number",
    label: "Contains a number",
    test: (v) => /[0-9]/.test(v ?? ""),
  },
];

function RuleRow({ label, passed, touched }) {
  if (!touched) return null;
  return (
    <li className="flex items-center gap-2 text-xs uppercase tracking-wide">
      {passed ? (
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500/20 text-green-500">
          <Check className="w-2.5 h-2.5" strokeWidth={3} />
        </span>
      ) : (
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500/20 text-red-500">
          <X className="w-2.5 h-2.5" strokeWidth={3} />
        </span>
      )}
      <span className={passed ? "text-green-500" : "text-red-500"}>
        {label}
      </span>
    </li>
  );
}

export default function RegisterForm() {
  const { register: registerUser } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registered, setRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm({ mode: "onChange" });

  const password = watch("password") ?? "";
  const passwordConfirm = watch("password_confirmation") ?? "";
  const passwordTouched = !!touchedFields.password;
  const confirmTouched = !!touchedFields.password_confirmation;
  const confirmMatches =
    passwordConfirm === password && passwordConfirm.length > 0;

  const onSubmit = async (data) => {
    setServerError("");
    const res = await registerUser(
      data.username,
      data.email,
      data.password,
      data.password_confirmation,
    );
    if (res?.success) {
      setRegistered(true);
    } else {
      setServerError(res?.error ?? "Registration failed. Please try again.");
    }
  };

  if (registered) {
    return (
      <div className="flex flex-col items-center text-center py-4 space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Clock className="w-7 h-7 text-amber-500" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
            Account Pending Activation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
            Your account has been created. An HR administrator must activate it
            before you can log in. Please check back later.
          </p>
        </div>
        <Link
          to="/login"
          className="text-sm font-semibold text-blue-700 hover:underline uppercase tracking-wider"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="username"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
        >
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          autoComplete="username"
          className="bg-white/80 dark:bg-gray-800/80 uppercase"
          {...register("username", {
            required: "Username is required.",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters.",
            },
          })}
        />
        {errors.username && (
          <p className="text-xs text-red-500 uppercase tracking-wide">
            {errors.username.message}
          </p>
        )}
      </div>

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
        {passwordTouched && (
          <ul className="mt-2 space-y-1 pl-0.5">
            {PASSWORD_RULES.map((rule) => (
              <RuleRow
                key={rule.id}
                label={rule.label}
                passed={rule.test(password)}
                touched={passwordTouched}
              />
            ))}
          </ul>
        )}
      </div>

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
        {confirmTouched && passwordConfirm.length > 0 && (
          <ul className="mt-2 pl-0.5">
            <RuleRow
              label="Passwords match"
              passed={confirmMatches}
              touched={confirmTouched}
            />
          </ul>
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
