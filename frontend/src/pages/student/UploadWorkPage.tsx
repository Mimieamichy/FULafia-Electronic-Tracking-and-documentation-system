// src/pages/UploadWorkPage.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, FileText, MessageCircle } from "lucide-react";
import { Send } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { useToast } from "@/hooks/use-toast";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function UploadWorkPage() {
  // state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [projectTopic, setProjectTopic] = useState("");
  const [studentComment, setStudentComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [uploadingTopic, setUploadingTopic] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // new: keep a record of last-submitted values for preview after clearing inputs
  const [lastSubmittedTopic, setLastSubmittedTopic] = useState<string | null>(
    null
  );
  const [lastSubmittedFileName, setLastSubmittedFileName] = useState<
    string | null
  >(null);

  // useRef so we can reset the actual file input element value
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { token, user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setPreviewFileName(null);
      return;
    }

    // validation (MIME + extension + size)
    const allowedMimeTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);
    const getExtension = (name: string) => {
      const idx = name.lastIndexOf(".");
      return idx >= 0 ? name.slice(idx).toLowerCase() : "";
    };

    const mimeOk = allowedMimeTypes.has(file.type);
    const extOk = allowedExtensions.has(getExtension(file.name));
    const MAX_FILE_BYTES = 5 * 1024 * 1024;

    if (!mimeOk && !extOk) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF and Word documents are allowed.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      setSelectedFile(null);
      setPreviewFileName(null);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      toast({
        title: "File Too Large",
        description: "File too large. Maximum allowed size is 5 MB.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      setSelectedFile(null);
      setPreviewFileName(null);
      return;
    }

    setSelectedFile(file);
    setPreviewFileName(file.name);
  };

  const handleSendComment = async () => {
    if (!studentComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment before sending.",
        variant: "destructive",
      });
      return;
    }

    setSendingComment(true);
    try {
      const commentEndpoint = `${baseUrl}/project/comment`; // adjust if your backend uses a different route
      const payload: any = {
        comment: studentComment.trim(),
        projectTopic: projectTopic.trim() || undefined,
      };
      if (user?.id) payload.studentId = user.id;

      const res = await fetch(commentEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => null);
      console.log("Comment response:", res.status, text);

      if (res.ok) {
        setStudentComment("");
        toast({
          title: "Comment Sent",
          description: "Your comment has been sent to the supervisor.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Comment Failed",
          description: `Sending comment failed (${res.status}). See console for details.`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Comment send error:", err);
      toast({
        title: "Comment Send Error",
        description:
          "Unexpected error sending comment. See console for details.",
        variant: "destructive",
      });
    } finally {
      setSendingComment(false);
    }
  };

  const handleSubmitTopic = async () => {
    if (!projectTopic.trim()) {
      toast({
        title: "Project Topic Required",
        description: "Please enter your project topic.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a file to upload with your topic.",
        variant: "destructive",
      });
      return;
    }

    setUploadingTopic(true);
    try {
      const form = new FormData();
      form.append("topic", projectTopic.trim());
      form.append("project", selectedFile);
      if (user?.id) form.append("studentId", String(user.id));

      const res = await fetch(`${baseUrl}/project/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form, // browser sets Content-Type boundary automatically
      });

      const text = await res.text().catch(() => null);
      console.log("Topic upload response:", res.status, text);

      if (res.ok) {
        // store last-submitted values for preview
        setLastSubmittedTopic(projectTopic.trim());
        setLastSubmittedFileName(previewFileName);

        // clear the input fields
        setProjectTopic("");
        setSelectedFile(null);
        setPreviewFileName(null);
        // clear the actual file input element value
        if (fileInputRef.current) fileInputRef.current.value = "";

        setSubmitted(true);

        toast({
          title: "Upload Successful",
          description: "Your project topic and file have been uploaded.",
          variant: "default",
        });
      } else {
        toast({
          title: "Upload Failed",
          description:
            "There was an error uploading your project topic and file.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload Error",
        description: "Unexpected error during upload. See console for details.",
        variant: "destructive",
      });
    } finally {
      setUploadingTopic(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-800">Upload Work</h1>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-5 w-full max-w-2xl mx-auto">
        {/* Project Topic */}
        <div className="space-y-1">
          <label className="text-gray-700 font-medium block">
            Project Topic:
          </label>
          <Input
            value={projectTopic}
            onChange={(e) => setProjectTopic(e.target.value)}
            placeholder="Enter your project topic"
            className="w-full"
            name="topic"
          />
        </div>

        {/* File Upload */}

        <div className="space-y-1">
          <label className="text-gray-700 font-medium block">
            Upload File (PDF / DOC / DOCX, max 5MB):
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf,.doc,application/msword,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="w-full text-sm"
          />

          {previewFileName && (
            <div className="mt-2 flex items-center gap-2 text-green-600 text-sm break-all">
              <FileText size={18} /> {previewFileName}
            </div>
          )}
        </div>

        {/* Submit Topic button */}
        <div className="pt-2">
          <Button
            onClick={handleSubmitTopic}
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white"
            disabled={uploadingTopic}
          >
            <Upload className="mr-2 h-5 w-5" />
            {uploadingTopic ? "Submitting ..." : "Submit"}
          </Button>
        </div>

        {/* Student Comment */}
        <div className="space-y-1 mt-4">
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

          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={handleSendComment}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={sendingComment}
            >
              <Send className="mr-2 h-4 w-4" />{" "}
              {sendingComment ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>

        {/* Preview After Submission */}
        {submitted && (
          <div className="border-t pt-4 mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Submitted Preview
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Project Topic:</strong> {lastSubmittedTopic ?? "—"}
              </p>
              <p>
                <strong>Uploaded File:</strong> {lastSubmittedFileName ?? "—"}
              </p>
            </div>
            ...
          </div>
        )}
      </div>
    </div>
  );
}
