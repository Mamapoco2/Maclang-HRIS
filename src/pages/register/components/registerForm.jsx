import { useContext, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import axios from "../../../api/api";

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v) => v?.length >= 8 },
  {
    id: "uppercase",
    label: "Uppercase letter",
    test: (v) => /[A-Z]/.test(v ?? ""),
  },
  {
    id: "number",
    label: "Contains a number",
    test: (v) => /[0-9]/.test(v ?? ""),
  },
];

function generateUsername(givenName = "", lastName = "") {
  const initials = givenName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
  const last = lastName.trim().toUpperCase().replace(/\s+/g, "");
  return initials + last;
}

function RuleRow({ label, passed, touched }) {
  if (!touched) return null;
  return (
    <li className="flex items-center gap-1.5 text-xs">
      {passed ? (
        <Check className="w-3 h-3 text-green-500 shrink-0" strokeWidth={3} />
      ) : (
        <X className="w-3 h-3 text-red-500 shrink-0" strokeWidth={3} />
      )}
      <span
        className={
          passed ? "text-green-600 dark:text-green-400" : "text-red-500"
        }
      >
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

  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const usernameManuallyEdited = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm({ mode: "onChange" });

  const password = watch("password") ?? "";
  const passwordConfirm = watch("password_confirmation") ?? "";
  const passwordTouched = !!touchedFields.password;
  const confirmTouched = !!touchedFields.password_confirmation;
  const confirmMatches =
    passwordConfirm === password && passwordConfirm.length > 0;

  const givenName = watch("given_name") ?? "";
  const middleName = watch("middle_name") ?? "";
  const lastName = watch("last_name") ?? "";
  const username = watch("username") ?? "";

  const syncUsername = () => {
    if (usernameManuallyEdited.current) return;

    const gn = watch("given_name") ?? "";
    const ln = watch("last_name") ?? "";
    const generated = generateUsername(gn, ln);
    setValue("username", generated, { shouldValidate: true });
  };

  useEffect(() => {
    if (!username || username.trim().length < 2) {
      setUsernameStatus("idle");
      setUsernameSuggestions([]);
      return;
    }

    setUsernameStatus("checking");

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.post("/check-username", {
          username,
          given_name: givenName,
          middle_name: middleName,
          last_name: lastName,
        });

        setUsernameStatus(res.data.available ? "available" : "taken");
        setUsernameSuggestions(res.data.suggestions || []);
      } catch {
        setUsernameStatus("idle");
        setUsernameSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username, givenName, middleName, lastName]);

  const handleSuggestionClick = (suggestion) => {
    usernameManuallyEdited.current = true;
    setValue("username", suggestion, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setServerError("");

    if (usernameStatus === "taken") {
      setServerError("Please choose an available username before continuing.");
      return;
    }

    const res = await registerUser(
      data.given_name,
      data.middle_name,
      data.last_name,
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
      <div className="flex flex-col items-center text-center py-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <div className="space-y-2">
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      {/* SECTION: Personal Information */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
          Personal Information
        </p>

        {/* GIVEN NAME — full width */}
        <div className="space-y-1.5">
          <Label
            htmlFor="given_name"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Given Name
          </Label>
          <Input
            id="given_name"
            type="text"
            placeholder="e.g. Elias"
            autoComplete="given-name"
            className="bg-white/80 dark:bg-gray-800/80 uppercase h-10"
            {...register("given_name", {
              required: "Given name is required.",
              minLength: { value: 2, message: "Too short." },
              onChange: () => syncUsername(),
            })}
          />
          {errors.given_name && (
            <p className="text-xs text-red-500">{errors.given_name.message}</p>
          )}
        </div>

        {/* MIDDLE + LAST NAME — 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="middle_name"
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Middle Name{" "}
              <span className="normal-case font-normal text-gray-400 text-xs">
                (optional)
              </span>
            </Label>
            <Input
              id="middle_name"
              type="text"
              placeholder="e.g. Santos"
              autoComplete="additional-name"
              className="bg-white/80 dark:bg-gray-800/80 uppercase h-10"
              {...register("middle_name", {
                onChange: () => syncUsername(),
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="last_name"
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Last Name
            </Label>
            <Input
              id="last_name"
              type="text"
              placeholder="e.g. Marquez"
              autoComplete="family-name"
              className="bg-white/80 dark:bg-gray-800/80 uppercase h-10"
              {...register("last_name", {
                required: "Last name is required.",
                minLength: { value: 2, message: "Too short." },
                onChange: () => syncUsername(),
              })}
            />
            {errors.last_name && (
              <p className="text-xs text-red-500">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* USERNAME */}
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Username
          </Label>
          <Input
            id="username"
            type="text"
            readOnly
            tabIndex={-1}
            placeholder="Auto-generated from your name"
            className="bg-gray-50 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 cursor-default uppercase h-10"
            {...register("username", { required: "Username is required." })}
          />

          {/* Status messages */}
          {usernameStatus === "checking" && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              Checking availability...
            </p>
          )}

          {usernameStatus === "available" && (
            <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <Check className="w-3 h-3 shrink-0" strokeWidth={3} />
              Username is available
            </p>
          )}

          {usernameStatus === "taken" && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="w-3 h-3 shrink-0" />
                This username is already taken. Please choose one of the
                suggestions below.
              </p>
              {usernameSuggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    Available:
                  </span>
                  {usernameSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {usernameStatus === "idle" && username.length >= 2 && (
            <p className="flex items-center gap-1.5 text-xs text-blue-500 dark:text-blue-400">
              <Sparkles className="w-3 h-3 shrink-0" />
              Auto-generated username:{" "}
              <span className="font-semibold tracking-wide">{username}</span>
            </p>
          )}

          {errors.username && (
            <p className="text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>
      </div>

      {/* SECTION: Account Details */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
          Account Details
        </p>

        {/* EMAIL */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="bg-white/80 dark:bg-gray-800/80 h-10"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email address.",
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD ROW — 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* PASSWORD */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-white/80 dark:bg-gray-800/80 pr-10 h-10"
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
              <ul className="mt-2 space-y-1.5">
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

          {/* CONFIRM PASSWORD */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password_confirmation"
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="password_confirmation"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-white/80 dark:bg-gray-800/80 pr-10 h-10"
                {...register("password_confirmation", {
                  required: "Please confirm your password.",
                  validate: (val) =>
                    val === password || "Passwords do not match.",
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
              <ul className="mt-2">
                <RuleRow
                  label="Passwords match"
                  passed={confirmMatches}
                  touched={confirmTouched}
                />
              </ul>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || usernameStatus === "taken"}
        className="w-full bg-blue-700 hover:bg-blue-600 text-white uppercase tracking-widest font-semibold h-11"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
