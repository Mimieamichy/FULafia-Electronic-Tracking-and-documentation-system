
import { DashboardView } from "./DashboardShell";
import { useAuth } from "./AuthProvider";

interface DashboardMenuProps {
  onSelect: (view: DashboardView) => void;
}

const DashboardMenu = ({ onSelect }: DashboardMenuProps) => {
  const { role } = useAuth();
  const isProvost = role === "PROVOST";
  
  return (
    <ul className="space-y-3 text-gray-700">
      <li onClick={() => onSelect('overview')}>Dashboard</li>
      <li onClick={() => onSelect('pgLecturer')}>PG&Lecturer Management</li>
      <li onClick={() => onSelect('studentSession')}>Seminar & Sessions</li>
      <li onClick={() => onSelect('myStudents')}>My Students</li>
      {isProvost && (
        <li onClick={() => onSelect('activityLog')}>Activity Log</li>
      )}
      <li onClick={() => onSelect('notifications')}>Notifications</li>
      {/* Only HOD can assign other PG coords */}
      
    </ul>
  );
};
export default DashboardMenu;
