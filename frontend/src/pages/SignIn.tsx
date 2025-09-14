// src/SignIn.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: loggedInUser } = await login(formData.email, formData.password);

      const role = (loggedInUser?.role ?? "unknown").toString().trim().toLowerCase();

      switch (role) {
        case "hod":
        case "pgcord":
        case "provost":
          navigate("/dashboard");
          break;
        case "dean":
          navigate("/dean");
          break;
        case "admin":
          navigate("/admin");
          break;
        case "supervisor":
        case "internalsupervisor":
          navigate("/supervisor");
          break;
        case "student":
          navigate("/student");
          break;
        default:
          toast({
            title: "Unknown Role",
            description: `Cannot redirect—role "${loggedInUser?.role}" not recognized.`,
            variant: "destructive",
          });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        title: "Login Failed",
        description: err?.message ?? "Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2"
        style={{
          backgroundImage: `url('/images/bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-gray-800 mb-2">Sign In</h1>
            <p className="text-gray-600">Fill in your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-3">Email:</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full border-gray-300 rounded-full px-6 py-4 text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-3">Password:</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full border-gray-300 rounded-full px-6 py-4 pr-14 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forget-password" className="text-sm text-amber-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-4 rounded-full text-xl font-medium flex items-center justify-center gap-3 mt-8"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
              <ArrowRight size={24} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
