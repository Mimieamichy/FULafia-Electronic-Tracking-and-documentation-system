import { useAuth } from "../AuthProvider";

export default function StudentDashboard() {
  const { userName } = useAuth();

  // Mock session and stage data (replace with real data when API is available)
  const currentSession = "2024/2025";
  const currentStage = "Proposal Defense"; // or "Chapter 1-3 Review", etc.

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 break-words">
        Welcome, {userName}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-6 w-full">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Academic Session</p>
          <p className="text-lg font-semibold text-gray-800">{currentSession}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-500">Current Research Stage</p>
          <p className="text-lg font-semibold text-gray-800">{currentStage}</p>
        </div>

        <div className="text-sm text-gray-600 pt-4">
          Make sure to upload your work as you progress through each stage.
        </div>
      </div>
    </div>
  );
}
