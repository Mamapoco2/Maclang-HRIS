// src/pages/register/components/registerForm.jsx
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
        <Check className="w-3 h-3 text-[#2F9E58] shrink-0" strokeWidth={3} />
      ) : (
        <X className="w-3 h-3 text-[#C2410C] shrink-0" strokeWidth={3} />
      )}
      <span className={passed ? "text-[#2F9E58]" : "text-[#C2410C]"}>
        {label}
      </span>
    </li>
  );
}

const sectionLabel =
  "text-[11px] font-medium text-[#7C93A8] uppercase tracking-[0.15em] border-b border-[#D7E0E8] pb-2 font-['IBM_Plex_Mono',monospace]";
const fieldLabel = "text-xs font-medium text-[#5A7188] uppercase tracking-wide";
const fieldInput =
  "h-10 rounded-lg border-[#D7E0E8] bg-white text-[#16324A] placeholder:text-[#9BAAB8] focus-visible:border-[#6FA3D8] focus-visible:ring-[#6FA3D8]/30";

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
      <div className="flex flex-col items-center space-y-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8A33D]/10">
          <Clock className="h-8 w-8 text-[#E8A33D]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-['Petrona',serif] text-lg font-semibold text-[#16324A]">
            Account pending activation
          </h3>
          <p className="max-w-xs text-sm leading-relaxed text-[#5A7188]">
            Your account has been created. An HR administrator must activate it
            before you can log in. Please check back later.
          </p>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-[#16324A] underline decoration-[#6FA3D8] decoration-2 underline-offset-4 transition-colors hover:text-[#6FA3D8]"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-md border border-[#E8A33D]/30 bg-[#E8A33D]/10 px-4 py-3 text-sm text-[#8A5A12]">
          {serverError}
        </div>
      )}

      {/* SECTION: Personal Information */}
      <div className="space-y-4">
        <p className={sectionLabel}>Personal Information</p>

        {/* GIVEN NAME — full width */}
        <div className="space-y-1.5">
          <Label htmlFor="given_name" className={fieldLabel}>
            Given Name
          </Label>
          <Input
            id="given_name"
            type="text"
            placeholder="e.g. Elias"
            autoComplete="given-name"
            className={fieldInput}
            {...register("given_name", {
              required: "Given name is required.",
              minLength: { value: 2, message: "Too short." },
              onChange: () => syncUsername(),
            })}
          />
          {errors.given_name && (
            <p className="text-xs text-[#C2410C]">
              {errors.given_name.message}
            </p>
          )}
        </div>

        {/* MIDDLE + LAST NAME — 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="middle_name" className={fieldLabel}>
              Middle Name{" "}
              <span className="text-[11px] font-normal normal-case text-[#9BAAB8]">
                (optional)
              </span>
            </Label>
            <Input
              id="middle_name"
              type="text"
              placeholder="e.g. Santos"
              autoComplete="additional-name"
              className={fieldInput}
              {...register("middle_name", {
                onChange: () => syncUsername(),
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last_name" className={fieldLabel}>
              Last Name
            </Label>
            <Input
              id="last_name"
              type="text"
              placeholder="e.g. Marquez"
              autoComplete="family-name"
              className={fieldInput}
              {...register("last_name", {
                required: "Last name is required.",
                minLength: { value: 2, message: "Too short." },
                onChange: () => syncUsername(),
              })}
            />
            {errors.last_name && (
              <p className="text-xs text-[#C2410C]">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        {/* USERNAME */}
        <div className="space-y-1.5">
          <Label htmlFor="username" className={fieldLabel}>
            Username
          </Label>
          <Input
            id="username"
            type="text"
            readOnly
            tabIndex={-1}
            placeholder="Auto-generated from your name"
            className="h-10 cursor-default rounded-lg border-[#D7E0E8] bg-[#F1F4F7] text-[#5A7188]"
            {...register("username", { required: "Username is required." })}
          />

          {usernameStatus === "checking" && (
            <p className="flex items-center gap-1.5 text-xs text-[#9BAAB8]">
              <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
              Checking availability...
            </p>
          )}

          {usernameStatus === "available" && (
            <p className="flex items-center gap-1.5 text-xs text-[#2F9E58]">
              <Check className="h-3 w-3 shrink-0" strokeWidth={3} />
              Username is available
            </p>
          )}

          {usernameStatus === "taken" && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-[#C2410C]">
                <AlertCircle className="h-3 w-3 shrink-0" />
                This username is already taken. Please choose one of the
                suggestions below.
              </p>
              {usernameSuggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-xs text-[#9BAAB8]">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    Available:
                  </span>
                  {usernameSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="rounded-md bg-[#6FA3D8]/10 px-2 py-1 text-xs font-medium text-[#16324A] transition-colors hover:bg-[#6FA3D8]/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {usernameStatus === "idle" && username.length >= 2 && (
            <p className="flex items-center gap-1.5 text-xs text-[#6FA3D8]">
              <Sparkles className="h-3 w-3 shrink-0" />
              Auto-generated username:{" "}
              <span className="font-semibold tracking-wide">{username}</span>
            </p>
          )}

          {errors.username && (
            <p className="text-xs text-[#C2410C]">{errors.username.message}</p>
          )}
        </div>
      </div>

      {/* SECTION: Account Details */}
      <div className="space-y-4">
        <p className={sectionLabel}>Account Details</p>

        {/* EMAIL */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className={fieldLabel}>
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={fieldInput}
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email address.",
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-[#C2410C]">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD ROW — 2 columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* PASSWORD */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className={fieldLabel}>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`${fieldInput} pr-10`}
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "At least 8 characters." },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BAAB8] hover:text-[#16324A]"
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
            <Label htmlFor="password_confirmation" className={fieldLabel}>
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="password_confirmation"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`${fieldInput} pr-10`}
                {...register("password_confirmation", {
                  required: "Please confirm your password.",
                  validate: (val) =>
                    val === password || "Passwords do not match.",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BAAB8] hover:text-[#16324A]"
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
        className="h-11 w-full rounded-lg bg-[#16324A] text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#16324A]/90 disabled:opacity-60"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
