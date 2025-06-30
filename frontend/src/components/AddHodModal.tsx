
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddHodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hodData: any) => void;
}

const AddHodModal = ({ isOpen, onClose, onSubmit }: AddHodModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    staffId: "",
    email: "",
    faculty: "",
    department: "",
    
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    const hodData = {
      ...formData,
      role: "hod", // Fixed role as HOD
      type: "staff" // Fixed type as staff
    };
    
    onSubmit(hodData);
    setFormData({
      title: "",
      firstName: "",
      lastName: "",
      staffId: "",
      email: "",
      faculty: "",
      department: "",
      
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Add New HOD
            </DialogTitle>
            
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Title:</label>
              <Select onValueChange={(value) => handleInputChange("title", value)} required>
                <SelectTrigger className="w-full border-gray-300 rounded-full px-4 py-3">
                  <SelectValue placeholder="Select Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MR.">MR.</SelectItem>
                  <SelectItem value="MRS.">MRS.</SelectItem>
                  <SelectItem value="MISS.">MISS.</SelectItem>
                  <SelectItem value="DR.">DR.</SelectItem>
                  <SelectItem value="PROF.">PROF.</SelectItem>
                  <SelectItem value="ENGR.">ENGR.</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <label className="block text-gray-700 font-medium mb-2">Staff ID:</label>
              <Input
                type="text"
                value={formData.staffId}
                onChange={(e) => handleInputChange("staffId", e.target.value)}
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
              <Select onValueChange={(value) => handleInputChange("faculty", value)} required>
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
              <Select onValueChange={(value) => handleInputChange("department", value)} required>
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
           
          
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white px-12 py-3 text-lg font-medium"
            >
              ADD HOD
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHodModal;
