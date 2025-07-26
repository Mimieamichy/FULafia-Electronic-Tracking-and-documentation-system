import { useState, useEffect } from "react";

import { useAuth } from "../AuthProvider";

interface PGCoordinator {
  id: string;
  name: string;
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function PgCoordinatorTab() {
  const { token, user } = useAuth();
  const isHod = user?.role?.toUpperCase() === "HOD";

  
  const [currentCord, setCurrentCord] = useState<PGCoordinator | null>(null);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCoordinators() {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/lecturer/department`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const { data } = await res.json();
        console.log("raw payload:", data);
        // filter by user.roles includes 'pgcord'
        const pgList: PGCoordinator[] = data
          .filter(
            (item: any) =>
              Array.isArray(item.user?.roles) &&
              item.user.roles.includes("pgcord")
          )
          .map((item: any) => ({
            id: item._id,
            name: `${item.title} ${item.user.firstName} ${item.user.lastName}`,
          }));
        console.log("pgcord filtered:", pgList);
        
        setCurrentCord(pgList[0] || null);
      } catch (err) {
        console.error("Error fetching PG Coordinators:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isHod) fetchCoordinators();
  }, [isHod, token]);

  if (!isHod) return null;

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
        PG Coordinator
      </h2>

      <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : currentCord ? (
          <>
            <div>
              <p className="text-sm text-gray-500">Current Coordinator:</p>
              <p className="mt-1 text-lg font-medium text-gray-800 capitalize">
                {currentCord.name}
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-600">No PG Coordinators assigned.</p>
        )}
      </div>
    </div>
  );
}
