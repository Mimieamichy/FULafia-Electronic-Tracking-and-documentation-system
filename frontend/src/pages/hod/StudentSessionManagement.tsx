import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StudentStage {
  id: string;
  matNo: string;
  fullName: string;
  topic: string;
  firstSem: number | null;
  secondSem: number | null;
  thirdSem: number | null;
  externalDefenseDate: string | null;
  supervisor1: string;
  supervisor2: string;
}

const defenseOptions = ["First Seminar", "Second Seminar", "Third Seminar", "External Defense"];

const StudentSessionManagement = () => {
  // Degree tab
  const [degreeTab, setDegreeTab] = useState<"MSc" | "PhD">("MSc");
  // Search term
  const [search, setSearch] = useState("");
  // Table data
  const [students, setStudents] = useState<StudentStage[]>([
    {
      id: "1",
      matNo: "220976762",
      fullName: "Camilla Park",
      topic: "Secure Online Auction System",
      firstSem: 75,
      secondSem: 80,
      thirdSem: 90,
      externalDefenseDate: null,
      supervisor1: "Not Assigned",
      supervisor2: "Not Assigned",
    },
    {
      id: "2",
      matNo: "220976765",
      fullName: "Jacob Philip",
      topic: "Secure Online Auction System",
      firstSem: 72,
      secondSem: null,
      thirdSem: null,
      externalDefenseDate: null,
      supervisor1: "Not Assigned",
      supervisor2: "Not Assigned",
    },
    // ... more rows
  ]);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 7;

  // Defense stage
  const [selectedDefense, setSelectedDefense] = useState(defenseOptions[3]);
  const handleSetDate = () => {
    alert(`Set date for ${selectedDefense}`);
  };

  // Filtered list by search & degree
  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (degreeTab && s.id) {
        // If you had a degree field, you could filter by it here
      }
      const term = search.toLowerCase();
      return (
        s.matNo.includes(term) ||
        s.fullName.toLowerCase().includes(term) ||
        s.topic.toLowerCase().includes(term)
      );
    });
  }, [students, search, degreeTab]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Degree tabs */}
      <div className="flex border-b border-gray-200">
        {(["MSc", "PhD"] as const).map((dt) => (
          <button
            key={dt}
            onClick={() => {
              setDegreeTab(dt);
              setPage(1);
            }}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
              degreeTab === dt
                ? "border-amber-700 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {dt}
          </button>
        ))}
      </div>

      {/* Header, defense selector, search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {degreeTab} Ready for {selectedDefense}
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Defense:</span>
            <Select value={selectedDefense} onValueChange={(v) => { setSelectedDefense(v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={selectedDefense} />
              </SelectTrigger>
              <SelectContent>
                {defenseOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSetDate} className="bg-amber-700 hover:bg-amber-800 text-white">
              Set Date
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Search by Mat. No, Name, or Topic"
              className="flex-1"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border">MAT NO.</th>
              <th className="p-3 border">Full Name</th>
              <th className="p-3 border">Project Title</th>
              <th className="p-3 border">1st Supervisor</th>
              <th className="p-3 border">2nd Supervisor</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s, idx) => (
              <tr key={s.id} className={idx % 2 === 0 ? "bg-amber-50" : "bg-white"}>
                <td className="p-3 border">{s.matNo}</td>
                <td className="p-3 border">{s.fullName}</td>
                <td className="p-3 border">{s.topic}</td>
                <td className="p-3 border">{s.supervisor1}</td>
                <td className="p-3 border">{s.supervisor2}</td>
                <td className="p-3 border">
                  <Button
                    size="sm"
                    className="bg-amber-700 hover:bg-amber-800 text-white"
                    onClick={() => alert(`Assign supervisor for ${s.fullName}`)}
                  >
                    Assign
                  </Button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2 border rounded hover:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          <ChevronLeft />
        </button>
        <span className="text-gray-700">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2 border rounded hover:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default StudentSessionManagement;
