import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const res = await authService.register(data);
    if (res.success) navigate("/");
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* First Name */}
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input {...register("firstName")} placeholder="First name" />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input {...register("lastName")} placeholder="Last name" />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}
        </div>

        {/* Middle Name */}
        <div className="space-y-2">
          <Label>Middle Name</Label>
          <Input
            {...register("middleName")}
            placeholder="Middle name (optional)"
          />
        </div>

        {/* Suffix */}
        <div className="space-y-2">
          <Label>Suffix</Label>
          <Input {...register("suffix")} placeholder="Jr, Sr, III (optional)" />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            {...register("email")}
            placeholder="Email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          type={showPassword ? "text" : "password"}
          {...register("password_confirmation")}
          placeholder="Confirm password"
        />
        {errors.password_confirmation && (
          <p className="text-red-500 text-sm">
            {errors.password_confirmation.message}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-black text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </CardContent>
  );
}
