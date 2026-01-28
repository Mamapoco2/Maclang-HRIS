import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { AuthContext } from "@/context/authContext";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);

    // Optional: Show error message if login fails
    if (!result.success) {
      console.error("Login failed:", result.error);
      // You could set an error state here to show to the user
    }
  };

  // Redirect automatically after successful login
  useEffect(() => {
    console.log("AuthContext user changed:", user);
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input {...register("email")} placeholder="Email address" />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            {...register("password")}
            placeholder="Password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Signing In...
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </CardContent>
  );
}
