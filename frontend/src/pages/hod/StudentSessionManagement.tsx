import { useState } from "react";
import { Button } from "@/components/ui/button";
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
}

const defenseOptions = ["First Seminar", "Second Seminar", "Third Seminar", "External Defense"];

const StudentSessionManagement = () => {
  // Tab for degree type
  const [degreeTab, setDegreeTab] = useState<'MSc'|'PhD'>('MSc');
  // Table data (would normally filter by degreeTab)
  const [students, setStudents] = useState<StudentStage[]>([
    { id: '1', matNo: '220976762', fullName: 'Camilla Park', topic: 'Secure Online Auction System', firstSem: 75, secondSem: 80, thirdSem: 90, externalDefenseDate: null },
    { id: '2', matNo: '220976765', fullName: 'Jacob Philip', topic: 'Secure Online Auction System', firstSem: 72, secondSem: null, thirdSem: null, externalDefenseDate: null },
    // ... more rows
  ]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginated = students.slice(startIndex, startIndex + itemsPerPage);

  // Defense stage selection
  const [selectedDefense, setSelectedDefense] = useState(defenseOptions[3]);
  const handleSetDate = () => {
    alert(`Set date for ${selectedDefense}`);
  };

  return (
    <div className="space-y-6">
      {/* Degree selection tabs */}
      <div className="flex border-b border-gray-200">
        {['MSc','PhD'].map(dt => (
          <button
            key={dt}
            onClick={() => setDegreeTab(dt as 'MSc'|'PhD')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
              degreeTab === dt
                ? 'border-amber-700 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >{dt}</button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{degreeTab} Ready for {selectedDefense}</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Defense:</span>
          <Select onValueChange={(val) => setSelectedDefense(val)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={selectedDefense} />
            </SelectTrigger>
            <SelectContent>
              {defenseOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSetDate} className="bg-amber-700 hover:bg-amber-800 text-white">
            Set Date for {selectedDefense}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border">MAT NO.</th>
              <th className="p-3 border">Full Name</th>
              <th className="p-3 border">Topic</th>
              <th className="p-3 border">First Seminar</th>
              <th className="p-3 border">Second Seminar</th>
              <th className="p-3 border">Third Seminar</th>
              <th className="p-3 border">External Defense</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s, idx) => (
              <tr key={s.id} className={`${idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}`}>
                <td className="p-3 border">{s.matNo}</td>
                <td className="p-3 border">{s.fullName}</td>
                <td className="p-3 border">{s.topic}</td>
                <td className="p-3 border">{s.firstSem ?? '—'}</td>
                <td className="p-3 border">{s.secondSem ?? '—'}</td>
                <td className="p-3 border">{s.thirdSem ?? '—'}</td>
                <td className="p-3 border">{s.externalDefenseDate ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2 border rounded hover:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          <ChevronLeft />
        </button>
        <span className="text-gray-700">{page} / {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
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
