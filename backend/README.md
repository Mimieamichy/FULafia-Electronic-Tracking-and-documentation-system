# Service Functions - Thesis Management System

## 1. auth.service.ts

### Authentication & Authorization Functions
```typescript
// User Authentication
- login(email: string, password: string): Promise<AuthResponse>
- logout(userId: string): Promise<void>
- refreshToken(refreshToken: string): Promise<TokenResponse>
- validateToken(token: string): Promise<UserPayload>

// Password Management
- generateInitialPassword(): string
- hashPassword(password: string): Promise<string>
- comparePassword(password: string, hash: string): Promise<boolean>
- resetPassword(userId: string, newPassword: string): Promise<void>
- requestPasswordReset(email: string): Promise<void>
- confirmPasswordReset(token: string, newPassword: string): Promise<void>

// Session Management
- createSession(userId: string): Promise<SessionData>
- validateSession(sessionId: string): Promise<boolean>
- destroySession(sessionId: string): Promise<void>
- cleanExpiredSessions(): Promise<void>

// Role Verification
- verifyRole(userId: string, requiredRole: UserRole): Promise<boolean>
- checkPermission(userId: string, permission: string): Promise<boolean>
- getUserRoles(userId: string): Promise<UserRole[]>
```

## 2. user.service.ts

### User Management Functions
```typescript
// User CRUD Operations
- createUser(userData: CreateUserDto): Promise<User>
- getUserById(userId: string): Promise<User>
- getUserByEmail(email: string): Promise<User>
- updateUser(userId: string, updateData: UpdateUserDto): Promise<User>
- deleteUser(userId: string): Promise<void>
- getAllUsers(filters?: UserFilters): Promise<PaginatedUsers>

// User Profile Management
- updateProfile(userId: string, profileData: ProfileDto): Promise<User>
- uploadProfileImage(userId: string, imageFile: File): Promise<string>
- changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>

// Staff Registration
- registerStaff(staffData: StaffRegistrationDto): Promise<User>
- verifyStaffRegistration(token: string): Promise<void>
- approveStaffRegistration(userId: string): Promise<void>

// User Status Management
- activateUser(userId: string): Promise<void>
- deactivateUser(userId: string): Promise<void>
- suspendUser(userId: string, reason: string): Promise<void>
- getUsersByDepartment(departmentId: string): Promise<User[]>
- getUsersByRole(role: UserRole): Promise<User[]>

// Search and Filter
- searchUsers(query: string, filters?: UserFilters): Promise<User[]>
- getUsersWithPendingActions(): Promise<User[]>
```

## 3. student.service.ts

### Student Management Functions
```typescript
// Student Registration & Management
- registerStudent(studentData: StudentRegistrationDto): Promise<Student>
- getStudentById(studentId: string): Promise<Student>
- getStudentByMatricNumber(matricNumber: string): Promise<Student>
- updateStudent(studentId: string, updateData: UpdateStudentDto): Promise<Student>
- deleteStudent(studentId: string): Promise<void>

// Program Management
- assignProgram(studentId: string, program: ProgramType): Promise<void>
- changeProgram(studentId: string, newProgram: ProgramType): Promise<void>
- getStudentsByProgram(program: ProgramType): Promise<Student[]>
- getStudentsByDepartment(departmentId: string): Promise<Student[]>

// Supervisor Allocation
- allocateSupervisor(studentId: string, leadSupervisorId: string, secondSupervisorId?: string): Promise<void>
- changeSupervisor(studentId: string, newSupervisorId: string, supervisorType: 'lead' | 'second'): Promise<void>
- getSupervisors(studentId: string): Promise<SupervisorAllocation>
- getStudentsBySupervisor(supervisorId: string): Promise<Student[]>

// Academic Progress
- updateAcademicStatus(studentId: string, status: AcademicStatus): Promise<void>
- getStudentProgress(studentId: string): Promise<StudentProgress>
- getStudentsWithPendingDefences(): Promise<Student[]>
- getStudentsByStage(stage: ThesisStage): Promise<Student[]>

// Notifications & Communication
- notifyStudent(studentId: string, message: NotificationDto): Promise<void>
- getStudentNotifications(studentId: string): Promise<Notification[]>
- markNotificationAsRead(studentId: string, notificationId: string): Promise<void>

// Reports & Analytics
- getStudentStatistics(departmentId?: string): Promise<StudentStats>
- generateStudentReport(studentId: string): Promise<StudentReport>
- getOverdueStudents(): Promise<Student[]>
```

## 4. thesis.service.ts

### Thesis Management Functions
```typescript
// Thesis CRUD Operations
- createThesis(thesisData: CreateThesisDto): Promise<Thesis>
- getThesisById(thesisId: string): Promise<Thesis>
- getThesisByStudent(studentId: string): Promise<Thesis>
- updateThesis(thesisId: string, updateData: UpdateThesisDto): Promise<Thesis>
- deleteThesis(thesisId: string): Promise<void>

// Thesis Workflow Management
- updateThesisStage(thesisId: string, newStage: ThesisStage): Promise<void>
- moveToNextStage(thesisId: string): Promise<void>
- revertToPreviousStage(thesisId: string, reason: string): Promise<void>
- getThesesByStage(stage: ThesisStage): Promise<Thesis[]>

// Document Management
- uploadThesisDocument(thesisId: string, document: File, version?: string): Promise<Document>
- getThesisDocuments(thesisId: string): Promise<Document[]>
- getLatestDocument(thesisId: string): Promise<Document>
- downloadDocument(documentId: string): Promise<Buffer>

// Comments & Feedback
- addComment(thesisId: string, commentData: CommentDto): Promise<Comment>
- getComments(thesisId: string): Promise<Comment[]>
- updateComment(commentId: string, content: string): Promise<Comment>
- deleteComment(commentId: string): Promise<void>
- getCommentsByUser(userId: string, thesisId: string): Promise<Comment[]>

// Approval Workflow
- requestApproval(thesisId: string, approverRole: UserRole): Promise<void>
- approveThesis(thesisId: string, approverId: string): Promise<void>
- rejectThesis(thesisId: string, approverId: string, reason: string): Promise<void>
- getThesesPendingApproval(approverId: string): Promise<Thesis[]>

// Progress Tracking
- updateProgress(thesisId: string, progressData: ProgressDto): Promise<void>
- getThesisTimeline(thesisId: string): Promise<ThesisTimeline[]>
- getOverdueTheses(): Promise<Thesis[]>
- generateProgressReport(thesisId: string): Promise<ProgressReport>

// Search & Filter
- searchTheses(query: string, filters?: ThesisFilters): Promise<Thesis[]>
- getThesesByDepartment(departmentId: string): Promise<Thesis[]>
- getThesesBySupervisor(supervisorId: string): Promise<Thesis[]>
```

## 5. defence.service.ts

### Defence Management Functions
```typescript
// Defence Scheduling
- scheduleDefence(defenceData: ScheduleDefenceDto): Promise<Defence>
- rescheduleDefence(defenceId: string, newDate: Date): Promise<Defence>
- cancelDefence(defenceId: string, reason: string): Promise<void>
- getDefenceById(defenceId: string): Promise<Defence>

// Panel Management
- addPanelist(defenceId: string, panelistId: string, role: PanelistRole): Promise<void>
- removePanelist(defenceId: string, panelistId: string): Promise<void>
- updatePanelistRole(defenceId: string, panelistId: string, newRole: PanelistRole): Promise<void>
- getPanelists(defenceId: string): Promise<Panelist[]>
- getAvailablePanelists(date: Date, departmentId: string): Promise<User[]>

// Defence Types & Stages
- createProposalDefence(studentId: string, defenceData: ProposalDefenceDto): Promise<Defence>
- createInternalDefence(studentId: string, defenceData: InternalDefenceDto): Promise<Defence>
- createExternalDefence(studentId: string, defenceData: ExternalDefenceDto): Promise<Defence>
- createSeminar(studentId: string, seminarData: SeminarDto, seminarNumber: number): Promise<Defence>

// Defence Workflow
- startDefence(defenceId: string): Promise<void>
- completeDefence(defenceId: string): Promise<void>
- postponeDefence(defenceId: string, newDate: Date, reason: string): Promise<void>
- getDefencesByStudent(studentId: string): Promise<Defence[]>
- getDefencesByType(type: DefenceType): Promise<Defence[]>

// Notifications & Communications
- notifyPanelists(defenceId: string): Promise<void>
- sendDefenceReminder(defenceId: string): Promise<void>
- notifyDefenceResult(defenceId: string): Promise<void>

// Reports & Analytics
- getDefenceSchedule(startDate: Date, endDate: Date): Promise<Defence[]>
- getDefenceStatistics(departmentId?: string): Promise<DefenceStats>
- generateDefenceReport(defenceId: string): Promise<DefenceReport>
- getUpcomingDefences(userId: string): Promise<Defence[]>

// External Examiner Management
- assignExternalExaminer(defenceId: string, examinerId: string): Promise<void>
- removeExternalExaminer(defenceId: string): Promise<void>
- getExternalExaminers(): Promise<ExternalExaminer[]>
- createExternalExaminer(examinerData: ExternalExaminerDto): Promise<ExternalExaminer>
```

## 6. scoring.service.ts

### Scoring Management Functions
```typescript
// Score Sheet Templates
- createScoreSheetTemplate(templateData: ScoreSheetTemplateDto): Promise<ScoreSheetTemplate>
- getScoreSheetTemplate(templateId: string): Promise<ScoreSheetTemplate>
- updateScoreSheetTemplate(templateId: string, updateData: UpdateTemplateDto): Promise<ScoreSheetTemplate>
- deleteScoreSheetTemplate(templateId: string): Promise<void>
- getTemplatesByDefenceType(defenceType: DefenceType): Promise<ScoreSheetTemplate[]>

// Scoring Criteria Management
- addScoringCriteria(templateId: string, criteria: ScoringCriteriaDto): Promise<ScoringCriteria>
- updateScoringCriteria(criteriaId: string, updateData: UpdateCriteriaDto): Promise<ScoringCriteria>
- deleteScoringCriteria(criteriaId: string): Promise<void>
- getScoringCriteria(templateId: string): Promise<ScoringCriteria[]>

// Score Entry & Management
- enterScore(defenceId: string, panelistId: string, scores: ScoreEntryDto[]): Promise<Score[]>
- updateScore(scoreId: string, newScore: number): Promise<Score>
- getScoresByDefence(defenceId: string): Promise<Score[]>
- getScoresByPanelist(defenceId: string, panelistId: string): Promise<Score[]>

// Score Calculations
- calculateAverageScore(defenceId: string): Promise<number>
- calculateCriteriaAverages(defenceId: string): Promise<CriteriaAverage[]>
- calculateOverallGrade(defenceId: string): Promise<Grade>
- generateScoreReport(defenceId: string): Promise<ScoreReport>

// Score Validation
- validateScoreEntry(scoreData: ScoreEntryDto): Promise<ValidationResult>
- checkScoreCompleteness(defenceId: string): Promise<boolean>
- validateScoreRange(score: number, criteriaId: string): Promise<boolean>

// Score Analytics
- getScoreStatistics(defenceId: string): Promise<ScoreStatistics>
- compareScores(defenceId: string): Promise<ScoreComparison>
- getHistoricalScores(studentId: string): Promise<HistoricalScore[]>
- generateGradeDistribution(departmentId: string, period: DateRange): Promise<GradeDistribution>

// Comments on Scores
- addScoreComment(scoreId: string, comment: string, commenterId: string): Promise<ScoreComment>
- getScoreComments(scoreId: string): Promise<ScoreComment[]>
- updateScoreComment(commentId: string, newComment: string): Promise<ScoreComment>
```

## 7. notification.service.ts

### Notification Management Functions
```typescript
// Notification Creation
- createNotification(notificationData: CreateNotificationDto): Promise<Notification>
- createBulkNotifications(notifications: BulkNotificationDto[]): Promise<Notification[]>
- scheduleNotification(notificationData: ScheduledNotificationDto): Promise<ScheduledNotification>

// Notification Delivery
- sendNotification(notificationId: string): Promise<void>
- sendBulkNotifications(notificationIds: string[]): Promise<void>
- resendNotification(notificationId: string): Promise<void>

// User Notifications
- getUserNotifications(userId: string, filters?: NotificationFilters): Promise<Notification[]>
- markAsRead(notificationId: string, userId: string): Promise<void>
- markAllAsRead(userId: string): Promise<void>
- deleteNotification(notificationId: string, userId: string): Promise<void>

// System Notifications
- notifyDefenceScheduled(defenceId: string): Promise<void>
- notifySupervisorAssigned(studentId: string, supervisorId: string): Promise<void>
- notifyDocumentUploaded(thesisId: string, uploaderId: string): Promise<void>
- notifyCommentAdded(thesisId: string, commenterId: string): Promise<void>
- notifyStageTransition(thesisId: string, newStage: ThesisStage): Promise<void>
- notifyScoreSubmitted(defenceId: string, panelistId: string): Promise<void>
- notifyApprovalRequired(thesisId: string, approverId: string): Promise<void>

// Notification Templates
- createTemplate(templateData: NotificationTemplateDto): Promise<NotificationTemplate>
- getTemplate(templateId: string): Promise<NotificationTemplate>
- updateTemplate(templateId: string, updateData: UpdateTemplateDto): Promise<NotificationTemplate>
- deleteTemplate(templateId: string): Promise<void>

// Notification Settings
- updateUserSettings(userId: string, settings: NotificationSettingsDto): Promise<NotificationSettings>
- getUserSettings(userId: string): Promise<NotificationSettings>
- toggleNotificationType(userId: string, type: NotificationType, enabled: boolean): Promise<void>

// Notification Analytics
- getNotificationStats(userId?: string): Promise<NotificationStats>
- getDeliveryStats(startDate: Date, endDate: Date): Promise<DeliveryStats>
- getUnreadCount(userId: string): Promise<number>
```

## 8. email.service.ts

### Email Service Functions
```typescript
// Email Sending
- sendEmail(emailData: EmailDto): Promise<EmailResult>
- sendBulkEmails(emails: BulkEmailDto[]): Promise<EmailResult[]>
- sendTemplatedEmail(templateId: string, recipients: string[], data: any): Promise<EmailResult>

// Email Templates
- createEmailTemplate(templateData: EmailTemplateDto): Promise<EmailTemplate>
- getEmailTemplate(templateId: string): Promise<EmailTemplate>
- updateEmailTemplate(templateId: string, updateData: UpdateEmailTemplateDto): Promise<EmailTemplate>
- deleteEmailTemplate(templateId: string): Promise<void>
- renderTemplate(templateId: string, data: any): Promise<string>

// System Emails
- sendWelcomeEmail(userId: string): Promise<void>
- sendPasswordResetEmail(email: string, resetToken: string): Promise<void>
- sendAccountActivationEmail(email: string, activationToken: string): Promise<void>
- sendDefenceNotificationEmail(defenceId: string, recipientIds: string[]): Promise<void>
- sendDocumentApprovalEmail(thesisId: string, approverId: string): Promise<void>
- sendReminderEmail(reminderData: ReminderEmailDto): Promise<void>

// Email Configuration
- configureSmtpSettings(settings: SmtpSettingsDto): Promise<void>
- testEmailConfiguration(): Promise<boolean>
- validateEmailAddress(email: string): boolean
- checkEmailDelivery(emailId: string): Promise<DeliveryStatus>

// Email Queue Management
- queueEmail(emailData: QueueEmailDto): Promise<void>
- processEmailQueue(): Promise<void>
- retryFailedEmails(): Promise<void>
- getQueueStatus(): Promise<QueueStatus>

// Email Analytics
- getEmailStats(startDate: Date, endDate: Date): Promise<EmailStats>
- getDeliveryReport(emailId: string): Promise<DeliveryReport>
- getFailedEmails(): Promise<FailedEmail[]>
```

## 9. sms.service.ts

### SMS Service Functions
```typescript
// SMS Sending
- sendSms(smsData: SmsDto): Promise<SmsResult>
- sendBulkSms(messages: BulkSmsDto[]): Promise<SmsResult[]>
- sendTemplatedSms(templateId: string, recipients: string[], data: any): Promise<SmsResult>

// SMS Templates
- createSmsTemplate(templateData: SmsTemplateDto): Promise<SmsTemplate>
- getSmsTemplate(templateId: string): Promise<SmsTemplate>
- updateSmsTemplate(templateId: string, updateData: UpdateSmsTemplateDto): Promise<SmsTemplate>
- deleteSmsTemplate(templateId: string): Promise<void>

// System SMS
- sendDefenceNotificationSms(defenceId: string, recipientIds: string[]): Promise<void>
- sendUrgentAlertSms(alertData: AlertSmsDto): Promise<void>
- sendReminderSms(reminderData: ReminderSmsDto): Promise<void>
- sendPasswordResetSms(phoneNumber: string, resetCode: string): Promise<void>

// SMS Configuration
- configureSmsProvider(settings: SmsProviderSettingsDto): Promise<void>
- testSmsConfiguration(): Promise<boolean>
- validatePhoneNumber(phoneNumber: string): boolean
- checkSmsDelivery(smsId: string): Promise<DeliveryStatus>

// SMS Queue Management
- queueSms(smsData: QueueSmsDto): Promise<void>
- processSmsQueue(): Promise<void>
- retryFailedSms(): Promise<void>
- getSmsQueueStatus(): Promise<QueueStatus>

// SMS Analytics
- getSmsStats(startDate: Date, endDate: Date): Promise<SmsStats>
- getDeliveryReport(smsId: string): Promise<SmsDeliveryReport>
- getFailedSms(): Promise<FailedSms[]>
- getCostAnalysis(period: DateRange): Promise<CostAnalysis>
```

## 10. document.service.ts

### Document Management Functions
```typescript
// Document Upload & Storage
- uploadDocument(file: File, metadata: DocumentMetadataDto): Promise<Document>
- uploadNewVersion(documentId: string, file: File, versionNotes?: string): Promise<DocumentVersion>
- downloadDocument(documentId: string, userId: string): Promise<Buffer>
- deleteDocument(documentId: string): Promise<void>

// Document Versioning
- getDocumentVersions(documentId: string): Promise<DocumentVersion[]>
- getLatestVersion(documentId: string): Promise<DocumentVersion>
- getSpecificVersion(documentId: string, versionNumber: number): Promise<DocumentVersion>
- compareVersions(documentId: string, version1: number, version2: number): Promise<VersionComparison>
- revertToVersion(documentId: string, versionNumber: number): Promise<DocumentVersion>

// Document Access Control
- grantAccess(documentId: string, userId: string, permission: AccessPermission): Promise<void>
- revokeAccess(documentId: string, userId: string): Promise<void>
- checkAccess(documentId: string, userId: string): Promise<boolean>
- getDocumentPermissions(documentId: string): Promise<DocumentPermission[]>

// Document Processing
- extractTextFromDocument(documentId: string): Promise<string>
- generateDocumentPreview(documentId: string): Promise<string>
- validateDocumentFormat(file: File): Promise<ValidationResult>
- scanForPlagiarism(documentId: string): Promise<PlagiarismReport>

// Document Organization
- createFolder(folderData: CreateFolderDto): Promise<Folder>
- moveDocument(documentId: string, folderId: string): Promise<void>
- tagDocument(documentId: string, tags: string[]): Promise<void>
- searchDocuments(query: string, filters?: DocumentFilters): Promise<Document[]>

// Document Workflow
- submitForReview(documentId: string, reviewerId: string): Promise<void>
- approveDocument(documentId: string, approverId: string): Promise<void>
- rejectDocument(documentId: string, approverId: string, reason: string): Promise<void>
- getDocumentsForReview(reviewerId: string): Promise<Document[]>

// Document Analytics
- getDocumentStats(userId?: string): Promise<DocumentStats>
- getDownloadHistory(documentId: string): Promise<DownloadLog[]>
- getStorageUsage(userId?: string): Promise<StorageUsage>
- generateAccessReport(documentId: string): Promise<AccessReport>

// Backup & Recovery
- backupDocument(documentId: string): Promise<BackupResult>
- restoreDocument(backupId: string): Promise<Document>
- scheduleBackup(documentId: string, schedule: BackupSchedule): Promise<void>
```

## 11. activity.service.ts

### Activity Tracking Functions
```typescript
// Activity Logging
- logActivity(activityData: ActivityLogDto): Promise<ActivityLog>
- logUserActivity(userId: string, action: string, resource?: string, metadata?: any): Promise<ActivityLog>
- logSystemActivity(action: string, details: string, metadata?: any): Promise<ActivityLog>
- logSecurityEvent(eventData: SecurityEventDto): Promise<ActivityLog>

// Activity Retrieval
- getActivitiesByUser(userId: string, filters?: ActivityFilters): Promise<ActivityLog[]>
- getActivitiesByResource(resourceType: string, resourceId: string): Promise<ActivityLog[]>
- getActivityById(activityId: string): Promise<ActivityLog>
- getRecentActivities(limit?: number): Promise<ActivityLog[]>

// Activity Search & Filter
- searchActivities(query: string, filters?: ActivityFilters): Promise<ActivityLog[]>
- getActivitiesByDate(startDate: Date, endDate: Date): Promise<ActivityLog[]>
- getActivitiesByType(activityType: ActivityType): Promise<ActivityLog[]>
- getFailedActivities(): Promise<ActivityLog[]>

// User Session Tracking
- trackLogin(userId: string, ipAddress: string, userAgent: string): Promise<void>
- trackLogout(userId: string): Promise<void>
- trackPageView(userId: string, page: string): Promise<void>
- trackAction(userId: string, action: string, details?: any): Promise<void>

// System Monitoring
- trackSystemPerformance(metrics: PerformanceMetrics): Promise<void>
- trackApiUsage(endpoint: string, method: string, responseTime: number, statusCode: number): Promise<void>
- trackError(error: ErrorDto): Promise<void>
- trackDatabaseQuery(query: string, executionTime: number): Promise<void>

// Audit Trail
- generateAuditTrail(resourceId: string, resourceType: string): Promise<AuditTrail>
- getComplianceReport(startDate: Date, endDate: Date): Promise<ComplianceReport>
- exportAuditLog(filters: AuditFilters): Promise<Buffer>
- archiveOldActivities(retentionPeriod: number): Promise<void>

// Activity Analytics
- getActivityStatistics(period: DateRange): Promise<ActivityStats>
- getUserActivitySummary(userId: string, period: DateRange): Promise<UserActivitySummary>
- getSystemUsageMetrics(): Promise<SystemUsageMetrics>
- generateActivityReport(reportType: ReportType, filters?: any): Promise<ActivityReport>

// Real-time Activity Tracking
- getActiveUsers(): Promise<ActiveUser[]>
- trackRealtimeActivity(userId: string, activity: RealtimeActivity): Promise<void>
- getActivityFeed(userId: string, limit?: number): Promise<ActivityFeed[]>
- subscribeToActivityUpdates(userId: string, callback: ActivityCallback): Promise<void>

// Security & Compliance
- detectSuspiciousActivity(userId: string): Promise<SuspiciousActivity[]>
- flagUnauthorizedAccess(activityData: UnauthorizedAccessDto): Promise<void>
- generateSecurityReport(): Promise<SecurityReport>
- trackDataAccess(userId: string, dataType: string, action: string): Promise<void>

// Cleanup & Maintenance
- cleanupOldLogs(retentionPeriod: number): Promise<number>
- archiveActivities(archiveDate: Date): Promise<void>
- optimizeActivityStorage(): Promise<void>
- validateActivityIntegrity(): Promise<ValidationReport>
```

These service functions provide comprehensive coverage for all the business logic requirements of your thesis management system. Each service is designed to be modular, testable, and maintainable while handling the complex workflows you described.