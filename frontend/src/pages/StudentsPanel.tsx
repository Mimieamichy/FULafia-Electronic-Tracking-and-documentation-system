import React, { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Student {
  id: string;
  name: string;
  matNo: string;
  topic: string;
  fileUrl: string;
  comments: { by: string; text: string }[];
  scores: Record<string, number | null>;
  approved?: boolean;
  currentStage: string;
}

type Props = {
  students: Student[];
  onOpen: (s: Student) => void;
};

export default function StudentsPanel({ students, onOpen }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      return (
        (s.name ?? "").toLowerCase().includes(q) ||
        (s.matNo ?? "").toLowerCase().includes(q) ||
        (s.topic ?? "").toLowerCase().includes(q)
      );
    });
  }, [students, query]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header: title left, search right */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold tracking-wider text-gray-700">
          Student Projects
        </h3>

        <div className="w-72">
          <label htmlFor="students-search" className="sr-only">
            Search students
          </label>
          <div className="relative">
            <Input
              id="students-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, matric or project..."
              className="w-full pl-3 pr-10 text-sm py-2"
              aria-label="Search students by name, matric number or project title"
            />
            <Search
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-600"
              aria-hidden
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] table-fixed border-collapse">
          <thead>
            <tr className="bg-amber-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase p-4 border-b">
                Matric No
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase p-4 border-b">
                Full Name
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase p-4 border-b">
                Topic
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase p-4 border-b w-24">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-gray-500">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                  <td className="p-4 align-top border-b">
                    <div className="text-sm font-medium text-gray-800">{s.matNo}</div>
                  </td>

                  <td className="p-4 align-top border-b">
                    <div className="text-sm font-medium text-gray-800">{s.name}</div>
                  </td>
                  <td className="p-4 align-top border-b">
                    <div className="text-sm font-medium text-gray-800">{s.topic}</div>
                  </td>


                  <td className="p-4 align-top border-b text-right">
                    <button
                      onClick={() => onOpen(s)}
                      className="text-amber-600 hover:underline text-sm inline-flex items-center"
                      aria-label={`View ${s.name} project`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
