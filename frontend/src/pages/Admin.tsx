import { useState } from "react";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddHodModal from "@/components/AddHodModal";
import { Link } from "react-router-dom";

export interface HOD {
  id: string;
  name: string;
  title: string;
}

const Admin = () => {
  const [hods, setHods] = useState<HOD[]>([
    {
      id: "1",
      name: "MR. Omosugbehe P. Jonathan",
      title: "MR.",
    },
    {
      id: "2",
      name: "ENGR. Christabel Henry",
      title: "ENGR.",
    },
    {
      id: "3",
      name: "DR. James Bagudu",
      title: "DR.",
    },
    {
      id: "4",
      name: "MISS. Tanasia Jimoh",
      title: "MISS.",
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddHod = (hodData: any) => {
    const newHod: HOD = {
      id: Date.now().toString(),
      name: `${hodData.title} ${hodData.firstName} ${hodData.lastName}`,
      title: hodData.title,
    };
    setHods([...hods, newHod]);
    console.log("Added HOD:", hodData);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4 flex justify-end items-center">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Tue April 2024</span>
          <Link to="/" title="Sign out">
            <Power className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* List of HODs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-50 p-4 font-medium text-gray-700">
            <div>HODs</div>
            <div>Action</div>
          </div>

          {hods.map((hod, index) => (
            <div key={hod.id} className={`grid grid-cols-2 p-4 items-center border-b ${index % 2 === 0 ? 'bg-amber-50' : 'bg-white'}`}>
              <div className="text-gray-800">{hod.name}</div>
              <div>
                <Button
                  variant="outline"
                  className="bg-amber-700 text-white hover:bg-amber-800 border-amber-700"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end items-center mt-8">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3"
          >
            Add HOD
          </Button>
        </div>
      </main>

      <AddHodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddHod}
      />
    </div>
  );
};

export default Admin;
