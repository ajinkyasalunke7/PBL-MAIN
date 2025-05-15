import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/api";
import { setAuthToken } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function UserLogin() {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/hackathons";
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await login(values);

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      const { token, user_type } = response.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user_type", user_type);
      setAuthToken(token);

      enqueueSnackbar("Logged in successfully!", { variant: "success" });

      let targetPath = "/hackathons";
      if (user_type === "judge") {
        targetPath = "/judge/dashboard";
      } else if (user_type === "organizer") {
        targetPath = "/organizer/dashboard";
      }
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.message || "Login failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-center">Login to HackArch</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={"mt-2"}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label>Password</Label>
            <Input
              className={"mt-2"}
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <Link to={"/register"}>
          <p>Already have an account? click here</p>
        </Link>
      </div>
    </div>
  );
}
