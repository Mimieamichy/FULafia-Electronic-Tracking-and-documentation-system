import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, MessageCircle } from "lucide-react";

export default function UploadWorkPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentComment, setStudentComment] = useState("");
  const [supervisorComment, setSupervisorComment] = useState(
    "Great job on the structure. Refine your objectives."
  );
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !studentComment) {
      alert("Please upload your work and add a comment.");
      return;
    }
    setSubmitted(true);
    // TODO: Send file + comment to backend
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-800">Upload Work</h1>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-5 w-full max-w-2xl mx-auto">

        {/* File Upload */}
        <div className="space-y-1">
          <label className="text-gray-700 font-medium block">Upload PDF File:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
          {selectedFile && (
            <div className="mt-2 flex items-center gap-2 text-green-600 text-sm break-all">
              <FileText size={18} /> {selectedFile.name}
            </div>
          )}
        </div>

        {/* Student Comment */}
        <div className="space-y-1">
          <label className="text-gray-700 font-medium block">
            Comment to Supervisor:
          </label>
          <Textarea
            rows={4}
            value={studentComment}
            onChange={(e) => setStudentComment(e.target.value)}
            placeholder="Write a message or update here..."
            className="w-full"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white"
          >
            <Upload className="mr-2 h-5 w-5" /> Submit Work
          </Button>
        </div>

        {/* Preview After Submission */}
        {submitted && (
          <div className="border-t pt-4 mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Submitted Preview</h2>

            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Uploaded File:</strong> {selectedFile?.name}</p>
              <p><strong>Your Comment:</strong> {studentComment}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 flex flex-col sm:flex-row gap-2">
              <MessageCircle className="text-amber-600 mt-1 shrink-0" size={18} />
              <div>
                <strong>Supervisor Feedback:</strong>
                <p>{supervisorComment}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
