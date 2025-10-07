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

  // given a raw role value (array | json-string | comma-separated string | single string)
  // return a normalized deduped array of lowercase role strings
  function normalizeRoles(raw: any): string[] {
    if (!raw && raw !== "") return [];
    // if it's already an array
    if (Array.isArray(raw)) {
      return Array.from(new Set(raw.map((r) => String(r).trim().toLowerCase()).filter(Boolean)));
    }

    // if it's a string, try parsing JSON first (handles '["a","b"]')
    if (typeof raw === "string") {
      const str = raw.trim();
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return Array.from(new Set(parsed.map((r) => String(r).trim().toLowerCase()).filter(Boolean)));
        }
      } catch {
        // not JSON, fallthrough to comma split
      }
      // comma-separated (or single) string
      return Array.from(new Set(str.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)));
    }

    // fallback: stringify and split
    return Array.from(new Set(String(raw).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)));
  }

  // Choose route based on priority order. First match wins.
  function routeForRoles(roles: string[]) {
    // priority-ordered checks (highest first)
    const priorityMap: Array<{ keys: string[]; route: string }> = [
      { keys: ["admin"], route: "/admin" },
      { keys: ["dean"], route: "/dean" },
      { keys: ["hod", "pgcord", "provost"], route: "/dashboard" },
      // supervisor types should take precedence over faculty pg rep
      { keys: ["supervisor", "major_supervisor", "college_rep","internal_examiner"], route: "/supervisor" },
      { keys: ["student"], route: "/student" },
      // roles that land on defense-day
      { keys: ["external_examiner", "faculty_pg_rep", "panel_member", "lecturer"], route: "/defense-day" },
      // fallback lecturer/general -> dashboard
      
    ];

    for (const p of priorityMap) {
      if (roles.some((r) => p.keys.includes(r))) return p.route;
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: loggedInUser } = await login(
        formData.email,
        formData.password
      );

      // normalize incoming roles (supports array | JSON string | comma-separated)
      const roles = normalizeRoles(loggedInUser?.roles ?? loggedInUser?.roles ?? []);
      const chosenRoute = routeForRoles(roles);

      if (chosenRoute) {
        navigate(chosenRoute);
        return;
      }

      // if we couldn't determine a route, show the unknown role toast (keeps original behavior)
      toast({
        title: "Unknown Role",
        description: `Cannot redirect—role "${JSON.stringify(loggedInUser?.role)}" not recognized.`,
        variant: "destructive",
      });
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            FULAFIA Electronic Tracking and Documentation System
          </h1>
            <h1 className="text-4xl font-medium text-gray-800 mb-2">
              Sign In
            </h1>
            <p className="text-gray-600">Fill in your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-3">
                Email:
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full border-gray-300 rounded-full px-6 py-4 text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-3">
                Password:
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
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
                <Link
                  to="/forget-password"
                  className="text-sm text-amber-700 hover:underline"
                >
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
