import { useState } from "react";
import DashboardMenu from "./DashboardMenu";
import HodDashboardOverview from "./hod/HodDashboardOverview";
import PgLecturerManagement from "./hod/PgLecturerManagement";
import StudentSessionManagement from "./hod/StudentSessionManagement";
import NotificationsTab from "./hod/NotificationsTab"
import PgCoordinatorTab from "./hod/PgCoordinatorTab"; // for HOD only

// Define this type to represent all valid view names
export type DashboardView =
  | 'overview'
  | 'pgLecturer'
  | 'studentSession'
  | 'notifications'
  | 'assignPG';


const DashboardShell = () => {
  const [view, setView] = useState<DashboardView>('overview');


  const renderView = () => {
    switch (view) {
      case 'overview':       return <HodDashboardOverview />;
      case 'pgLecturer':     return <PgLecturerManagement />;
      case 'studentSession': return <StudentSessionManagement />;
      case 'notifications':  return <NotificationsTab />;
      case 'assignPG':       return <PgCoordinatorTab />;
      default:               return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-sidebar-background p-4">
        <DashboardMenu onSelect={setView} />
      </aside>
      <main className="flex-1 p-6 bg-background">
        {renderView()}
      </main>
    </div>
  );
};

export default DashboardShell;
