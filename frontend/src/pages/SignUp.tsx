
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userId: "",
    phoneNo: "",
    email: "",
    faculty: "",
    department: "",
    role: "",
    type: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign up form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">Sign Up</h1>
            <p className="text-gray-600">Fill in your details to sign up</p>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/signin" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Sign In!
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">First Name:</label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full border-gray-300 rounded-full px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Last Name:</label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full border-gray-300 rounded-full px-4 py-3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">User ID:</label>
              <Input
                type="text"
                value={formData.userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                className="w-full border-gray-300 rounded-full px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Phone No:</label>
              <Input
                type="tel"
                value={formData.phoneNo}
                onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                className="w-full border-gray-300 rounded-full px-4 py-3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email:</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full border-gray-300 rounded-full px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Faculty:</label>
              <Select onValueChange={(value) => handleInputChange("faculty", value)}>
                <SelectTrigger className="w-full border-gray-300 rounded-full px-4 py-3">
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Department:</label>
              <Select onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger className="w-full border-gray-300 rounded-full px-4 py-3">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="electrical">Electrical Engineering</SelectItem>
                  <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                  <SelectItem value="civil">Civil Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Role:</label>
              <Select onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger className="w-full border-gray-300 rounded-full px-4 py-3">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Type:</label>
              <Select onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="w-full border-gray-300 rounded-full px-4 py-3">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password:</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full border-gray-300 rounded-full px-4 py-3 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Confirm Password:</label>
            <div className="relative max-w-md">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="w-full border-gray-300 rounded-full px-4 py-3 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 py-4">
            By clicking continue, I agree to{" "}
            <span className="text-yellow-600 hover:text-yellow-700 cursor-pointer font-medium">
              Terms of Use
            </span>{" "}
            and acknowledge that I have read the{" "}
            <span className="text-yellow-600 hover:text-yellow-700 cursor-pointer font-medium">
              Privacy Policy
            </span>
            .
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-4 rounded-full text-lg font-medium flex items-center justify-center gap-2"
          >
            Submit
            <ArrowRight size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
