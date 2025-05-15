import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/api";
import { setAuthToken } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function OrganizerLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await login(values);
      // console.log(res);
      const token = res?.data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
        setAuthToken(token);
        enqueueSnackbar("Logged in successfully!", { variant: "success" });
        navigate("/organizer/dashboard"); // Redirect for organizers
      } else {
        enqueueSnackbar("Invalid response from server", { variant: "error" });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-center">Organizer Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="organizer@example.com"
              {...register("email")}
              className="mt-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label>Password</Label>
            <Input
              className="mt-2"
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
      </div>
    </div>
  );
}
