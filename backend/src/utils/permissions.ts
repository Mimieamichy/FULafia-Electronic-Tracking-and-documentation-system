export enum Role {
  STUDENT = 'student',
  LECTURER = 'lecturer',
  HOD = 'hod',
  PGCOORD = 'pgcord',
  DEAN = 'dean',
  SUPERVISOR = 'supervisor',
  MAJOR_SUPERVISOR = 'major_supervisor',
  PANEL_MEMBER = 'panel_member',
  FACULTY_PG_REP = 'faculty_pg_rep',
  INTERNAL_EXAMINER = 'internal_examiner',
  PROVOST = 'provost',
  EXTERNAL_EXAMINER = 'external_examiner',
  ADMIN = 'admin',
  GENERAL = 'general',
}

export enum Permission {
  // Student
  DOWNLOAD_PROJECT = 'download_project',
  UPLOAD_PROJECT = 'upload_project',
  VIEW_COMMENTS = 'view_comments',
  COMMENT = 'comment',

  // HOD
  ADD_LECTURER = 'add_lecturer',
  VIEW_LECTURERS = 'view_lecturers',
  VIEW_LECTURERS_BY_DEPARTMENT = 'view_lecturers_by_department',
  CREATE_SESSION = 'create_session',
  VIEW_SESSIONS = 'view_sessions',
  VIEW_DEPT_LECTURERS = 'view_dept_lecturers',
  SCHEDULE_DEFENSE = 'schedule_defense',
  END_DEFENSE = 'end_defense',
  START_DEFENSE = 'start_defense',
  APPROVE_DEFENSE = 'approve_defense',
  VIEW_DEPT_STUDENTS = 'view_dept_students',
  ADD_PANEL_MEMBERS = 'add_panel_members',
  ASSIGN_SUPERVISORS = 'assign_supervisors',
  VIEW_PROJECT_BY_DEPARTMENT = 'view_project_by_department',

  // PG Coord
  GENERATE_DEPT_SCORE_SHEET = 'generate_dept_score_sheet',

  // Dean
  VIEW_FACULTY_LECTURERS = 'view_faculty_lecturers',
  VIEW_PROJECT_BY_FACULTY = 'view_project_by_faculty',

  // Supervisor
  VIEW_PROJECT_BY_STUDENT = 'view_project_by_student',
  VIEW_DEFENSE = 'view_defence',
  // major supervisor
  APPROVE_STUDENT_PROJECT = 'approve_student_project',

  // Panel Member
  VIEW_STUDENTS_PANEL = 'view-students',
  SCORE_STUDENT = 'score_student',

  // Faculty PG Rep
  SCORE_STUDENT_GENERAL = 'score_student_general',

  // Internal Examiner
  // reuses many from above

  // Provost
  GENERATE_GENERAL_SCORE_SHEET = 'generate_general_score_sheet',
  ADD_EXTERNAL_EXAMINER = 'add_external_examiner',

  // External Examiner
  APPROVE_LAST_DEFENSE = 'approve_last_defense',

  // Admin
  VIEW_ALL_LECTURERS = 'view_all_lecturers',
  DELETE_LECTURER = 'delete-lecturer',
  ADD_HOD = 'add_hod',
  VIEW_ALL_STUDENTS = 'view_all_students',
  VIEW_ALL_PROJECTS = 'view_all_projects',
  VIEW_ALL_DEFENSES = 'view_all_defenses',
  VIEW_ACTIVITY_LOGS = 'view_activity_logs',
  VIEW_ALL_SESSIONS = 'view_all_sessions',
  GET_HODS = 'get_hods',
  GET_PROVOST = 'get_provost',
  

  // General
  LOGIN = 'login',
  LOGOUT = 'logout',
  FORGOT_PASSWORD = 'forgot_password',
  RESET_PASSWORD = 'reset_password',
  VIEW_NOTIFICATIONS = 'view_notifications',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.STUDENT]: [
    Permission.DOWNLOAD_PROJECT,
    Permission.UPLOAD_PROJECT,
    Permission.VIEW_COMMENTS,
    Permission.COMMENT,
  ],
  [Role.LECTURER]: [],
  [Role.HOD]: [
    Permission.ADD_LECTURER,
    Permission.VIEW_LECTURERS,
    Permission.VIEW_LECTURERS_BY_DEPARTMENT,
    Permission.CREATE_SESSION,
    Permission.VIEW_SESSIONS,
    Permission.VIEW_PROJECT_BY_DEPARTMENT,
    Permission.VIEW_DEPT_LECTURERS,
    Permission.SCHEDULE_DEFENSE,
    Permission.END_DEFENSE,
    Permission.START_DEFENSE,
    Permission.APPROVE_DEFENSE,
    Permission.VIEW_DEPT_STUDENTS,
    Permission.ADD_PANEL_MEMBERS,
    Permission.ASSIGN_SUPERVISORS,
    Permission.DOWNLOAD_PROJECT,
  ],
  [Role.PGCOORD]: [
    Permission.VIEW_DEPT_LECTURERS,
    Permission.ADD_LECTURER,
    Permission.DELETE_LECTURER,
    Permission.GENERATE_DEPT_SCORE_SHEET,
  ],
  [Role.DEAN]: [
    Permission.VIEW_FACULTY_LECTURERS, 
    Permission.VIEW_SESSIONS,
    Permission.VIEW_PROJECT_BY_FACULTY
  ],
  [Role.SUPERVISOR]: [
    Permission.VIEW_PROJECT_BY_STUDENT,
    Permission.DOWNLOAD_PROJECT,
    Permission.VIEW_DEFENSE,
    Permission.UPLOAD_PROJECT,
    Permission.VIEW_COMMENTS,
    Permission.COMMENT,
  ],
  [Role.MAJOR_SUPERVISOR]: [
    Permission.APPROVE_STUDENT_PROJECT
  ],
  [Role.PANEL_MEMBER]: [
    Permission.COMMENT,
    Permission.DOWNLOAD_PROJECT,
    Permission.VIEW_DEFENSE,
    Permission.SCORE_STUDENT,
  ],
  [Role.FACULTY_PG_REP]: [
    Permission.SCORE_STUDENT_GENERAL,
  ],
  [Role.INTERNAL_EXAMINER]: [
    Permission.DOWNLOAD_PROJECT,
    Permission.VIEW_PROJECT_BY_STUDENT,
    Permission.VIEW_DEFENSE,
    Permission.UPLOAD_PROJECT,
    Permission.VIEW_COMMENTS,
    Permission.COMMENT,
  ],
  [Role.PROVOST]: [
    Permission.VIEW_ALL_LECTURERS,
    Permission.VIEW_SESSIONS,
    Permission.SCHEDULE_DEFENSE,
    Permission.GENERATE_GENERAL_SCORE_SHEET,
    Permission.ADD_EXTERNAL_EXAMINER,
  ],
  [Role.EXTERNAL_EXAMINER]: [
    Permission.APPROVE_LAST_DEFENSE,
  ],
  [Role.ADMIN]: [
    Permission.VIEW_ALL_LECTURERS,
    Permission.DELETE_LECTURER,
    Permission.ADD_LECTURER,
    Permission.VIEW_ALL_SESSIONS,
    Permission.VIEW_ALL_STUDENTS,
    Permission.VIEW_ALL_PROJECTS,
    Permission.VIEW_ALL_DEFENSES,
    Permission.VIEW_ACTIVITY_LOGS,
    Permission.GET_HODS,
    Permission.ADD_HOD,
    Permission.GET_PROVOST
  ],
  [Role.GENERAL]: [
    Permission.LOGIN,
    Permission.LOGOUT,
    Permission.FORGOT_PASSWORD,
    Permission.RESET_PASSWORD,
    Permission.VIEW_NOTIFICATIONS,
  ],
};

/**
 * Helper to check if a given role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
/**
 * Helper to get all permissions for a given role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}