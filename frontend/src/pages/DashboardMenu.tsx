
import { useAuth } from "./AuthProvider";
import { DashboardView } from "./DashboardShell";

interface DashboardMenuProps {
  onSelect: (view: DashboardView) => void;
}

const DashboardMenu = ({ onSelect }: DashboardMenuProps) => {
  const { role } = useAuth();
  return (
    <ul className="space-y-3 text-gray-700">
      <li onClick={() => onSelect('overview')}>Dashboard</li>
      <li onClick={() => onSelect('pgLecturer')}>PG&Lecturer Management</li>
      <li onClick={() => onSelect('studentSession')}>Student & Sessions</li>
      <li onClick={() => onSelect('notifications')}>Notifications</li>
      {/* Only HOD can assign other PG coords */}
      {role === 'HOD' && (
        <li onClick={() => onSelect('assignPG')}>Assign PG Coordinator</li>
      )}
    </ul>
  );
};
export default DashboardMenu;
