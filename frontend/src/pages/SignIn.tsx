import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Admin sign in:", formData);
    // For now, simulate successful admin login
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side image */}
      <div
        className="hidden lg:flex lg:w-1/2"
        style={{
          backgroundImage: `url('/images/bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      {/* Right side form */}
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-4 rounded-full text-xl font-medium flex items-center justify-center gap-3 mt-8"
            >
              Sign In
              <ArrowRight size={24} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
