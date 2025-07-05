const STAGES = {
  MSC: {
    DEFAULT: 'default',
    PROPOSAL: 'proposal',
    INTERNAL: 'internal',
    EXTERNAL: 'external'
  },
  PHD: {
    DEFAULT: 'default',
    PROPOSAL_DEFENSE: 'proposal_defense',
    SECOND_SEMINAR: 'second_seminar',
    INTERNAL_DEFENSE: 'internal_defense',
    EXTERNAL_SEMINAR: 'external_seminar'
  }
};

const PROVOST_STAGES = {
  MSC: ['external'],
  PHD: ['second_seminar', 'internal_defense', 'external_seminar']
};


const ROLES = [ 
  'student', 
  'lecturer',
  'hod',
  'pgcord',
  'dean',
  'supervisor',
  'panel_member',
  'faculty_pg_rep',
  'internal_examiner',
  'provost',
  'external_examiner',
  'admin'
];

const ROLE_PERMISSIONS = {
  student: ['view_project', 'upload_project', 'view_comments', 'comment'],
  lecturer: ['view_project'],
  hod: ['add_lecturer', 'view_lecturers', 'view_lecturers_by_department', 'create_session', 'view_sessions', 'view_project', 'view_dept_lecturers', 'schedule_defense', 'end_defense', 'start_defense', 'approve_defense',  'view_dept_students', 'add_panel_members', 'assign_supervisors'],
  pgcord: ['view_dept_lecturers', 'add_lecturers', 'delete_lecturers', 'generate_dept_score_sheet'],
  dean: ['view_faculty_lecturers'],
  supervisor: ['view_students', 'view_project', 'view_defenses', 'upload_project', 'view_comments', 'comment'],
  major_supervisor: ['approve_student_project'],
  panel_member: ['view-students', 'view_project', 'view-defenses', 'score_student'],
  faculty_pg_rep: ['view_project', 'score_student_general'],
  internal_examiner: ['view_project', 'view_students', 'view_project', 'view_defenses', 'upload_project', 'view_comments', 'comment'],
  provost: ['view_lecturers', 'view_project', 'view_sessions', 'schedule_defense', 'generate_general_score_sheet', 'add_external_examiner' ],
  external_examiner: ['view_project', 'approve_defence'],
  admin: ['view_all_lecturers', 'delete-lecturer', 'add_hod', 'view_sessions', 'view_project', 'view_all_students', 'view_all_lecturers', 'view_all_projects', 'view_all_defenses', 'view_activity_logs', 'view_notifications', 'add_panel_members', 'assign_supervisors'],
  general: ['login', 'logout', 'forgot_password', 'reset_password', 'view_notifications']
};
