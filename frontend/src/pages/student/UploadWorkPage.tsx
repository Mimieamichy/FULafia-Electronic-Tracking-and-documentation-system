import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, MessageCircle } from "lucide-react";

export default function UploadWorkPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentComment, setStudentComment] = useState("");
  const [supervisorComment, setSupervisorComment] = useState("Great job on the structure. Refine your objectives.");
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Upload Work</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-5 max-w-2xl">

        {/* File Upload */}
        <div>
          <label className="text-gray-700 font-medium mb-2 block">Upload PDF File:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
          {selectedFile && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
              <FileText size={18} /> {selectedFile.name}
            </div>
          )}
        </div>

        {/* Student Comment */}
        <div>
          <label className="text-gray-700 font-medium mb-2 block">Comment to Supervisor:</label>
          <Textarea
            rows={4}
            value={studentComment}
            onChange={(e) => setStudentComment(e.target.value)}
            placeholder="Write a message or update here..."
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="bg-amber-700 hover:bg-amber-800 text-white"
        >
          <Upload className="mr-2 h-5 w-5" /> Submit Work
        </Button>

        {/* Preview After Submission */}
        {submitted && (
          <div className="border-t pt-4 mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Submitted Preview</h2>

            <div className="text-sm text-gray-700">
              <p><strong>Uploaded File:</strong> {selectedFile?.name}</p>
              <p className="mt-1"><strong>Your Comment:</strong> {studentComment}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 flex gap-2">
              <MessageCircle className="text-amber-600 mt-1" size={18} />
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
