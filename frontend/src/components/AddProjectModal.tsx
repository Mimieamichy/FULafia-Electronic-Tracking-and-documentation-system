
import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, document: File | null) => void;
}

const AddProjectModal = ({ isOpen, onClose, onSubmit }: AddProjectModalProps) => {
  const [projectTopic, setProjectTopic] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectTopic.trim()) {
      onSubmit(projectTopic, document);
      setProjectTopic("");
      setDocument(null);
      onClose();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDocument(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-medium text-gray-800">
              Fill in your details carefully
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="projectTopic" className="block text-lg font-medium text-gray-700 mb-3">
              Project Topic:
            </label>
            <Textarea
              id="projectTopic"
              value={projectTopic}
              onChange={(e) => setProjectTopic(e.target.value)}
              className="min-h-32 text-base border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              placeholder="Enter your project topic here..."
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-lg font-medium text-gray-700">
                Document:
              </label>
              <Button
                type="button"
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">
                {document ? document.name : "Drag and drop files here"}
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white px-12 py-3 text-lg font-medium"
            >
              SUBMIT
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
