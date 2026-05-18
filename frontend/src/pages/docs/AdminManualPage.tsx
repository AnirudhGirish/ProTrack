import DocLayout from './DocLayout';

export default function AdminManualPage() {
  return (
    <DocLayout
      title="Admin Manual"
      subtitle="Complete administration guide for system administrators managing Forest eOffice."
      lastUpdated="May 18, 2026"
      badge="Administrator Guide"
    >
      <h2>1. Administrator Overview</h2>
      <p>
        System administrators have full access to Forest eOffice, including user management, file operations, CSV data management, and system monitoring. This manual covers all administrative functions and best practices for maintaining a secure, accurate system.
      </p>
      <p>
        Administrative actions are all recorded in the audit log. Always perform admin operations using your own named administrator account — never use shared credentials.
      </p>

      <h2>2. Managing Users</h2>
      <h3>2.1 Creating a New User</h3>
      <p>Navigate to <strong>Admin → Users</strong> tab and fill in the Add User form:</p>
      <ul>
        <li><strong>Username</strong> — a unique identifier (typically firstname.lastname or employee code)</li>
        <li><strong>Password</strong> — a temporary password; advise the user to remember it (no self-service reset is available)</li>
        <li><strong>Full Name</strong> — displayed in dashboards and assignments</li>
        <li><strong>Role</strong> — select the appropriate access level (see below)</li>
        <li><strong>Employee ID</strong> — the official government employee number</li>
        <li><strong>Section</strong> — the department section the user belongs to</li>
      </ul>

      <h3>2.2 User Roles Reference</h3>
      <ul>
        <li><strong>Admin</strong> — Full system access. Reserve for IT administrators only.</li>
        <li><strong>Section Head</strong> — Can view section-level dashboards and employee scores for their section. Cannot create or delete users or files.</li>
        <li><strong>Employee</strong> — Access to their own assigned tasks only. The most common role.</li>
        <li><strong>Read Only</strong> — View-only access to dashboards. Suitable for senior officers requiring oversight without editing rights.</li>
      </ul>

      <h3>2.3 Deactivating a User</h3>
      <p>
        Currently, user deactivation is managed at the database level. Contact your infrastructure team to set <code>is_active = false</code> for a departed employee. Active development will add a UI toggle for this in a future release.
      </p>

      <h2>3. Managing Files</h2>
      <h3>3.1 Adding a Single File</h3>
      <p>Use <strong>Admin → Files → Add File</strong> form for individual file entry:</p>
      <ul>
        <li><strong>File No</strong> — the official government file number (e.g., KF/LL/2024/001)</li>
        <li><strong>Subject</strong> — a concise description of the file's subject matter</li>
        <li><strong>Section</strong> — the department section this file belongs to</li>
        <li><strong>Priority</strong> — Low, Normal, High, or Critical based on urgency</li>
      </ul>

      <h3>3.2 Bulk Import via CSV</h3>
      <p>For bulk uploads, use the <strong>Admin → CSV Import</strong> tab. The CSV must contain these columns:</p>
      <ul>
        <li><code>file_no</code> — unique file identifier</li>
        <li><code>subject</code> — file subject</li>
        <li><code>section</code> — department section</li>
        <li><code>priority</code> — low / normal / high / critical</li>
        <li><code>status</code> — received / in_progress / closed (optional, defaults to "received")</li>
        <li><code>created_date</code> — YYYY-MM-DD format (optional, defaults to today)</li>
      </ul>
      <p>
        Drag and drop your CSV file onto the import zone or click to browse. The system will validate each row and report any errors. Successfully imported rows are committed; invalid rows are skipped with error details shown in the toast notification.
      </p>

      <h3>3.3 Exporting Data</h3>
      <p>
        Use <strong>CSV Import → Download Current Data</strong> to export all file records to a CSV. This is useful for backups, external analysis, or reporting to senior management.
      </p>

      <h3>3.4 Deleting Files</h3>
      <p>
        Deleted files are permanently removed. A confirmation dialog is shown before deletion. Only delete files that were entered in error — for operationally closed files, use the "Closed" status instead.
      </p>

      <h2>4. Dashboard and Monitoring</h2>
      <p>
        The <strong>Dashboard</strong> gives you organisation-wide visibility. Key things to monitor:
      </p>
      <ul>
        <li><strong>Underperforming Sections</strong> — sections where backlog rate exceeds 30%. Investigate and consider reassigning files or adding resources.</li>
        <li><strong>Aged Pending Files</strong> — files pending for 14+ days. These are SLA risks and should be escalated to section heads.</li>
        <li><strong>Employee Leaderboard</strong> — use this to identify both high performers and those who may need support.</li>
      </ul>

      <h2>5. System Maintenance</h2>
      <h3>5.1 Regular Tasks</h3>
      <ul>
        <li>Weekly: Review underperforming sections and aged files. Export a CSV backup.</li>
        <li>Monthly: Audit active user accounts and deactivate accounts for departed employees.</li>
        <li>Quarterly: Review user roles and ensure role assignments still match current duties.</li>
      </ul>

      <h3>5.2 Security Checklist</h3>
      <ul>
        <li>Ensure no admin accounts use weak or shared passwords</li>
        <li>Review audit logs for any anomalous access patterns</li>
        <li>Confirm that departed employees' accounts are deactivated</li>
        <li>Verify that database backups are running successfully</li>
      </ul>

      <h2>6. Troubleshooting</h2>
      <ul>
        <li><strong>User cannot log in</strong> — Verify the username is spelled correctly and the account is active. Reset their password by creating a new one via the database if no UI reset is available yet.</li>
        <li><strong>CSV import errors</strong> — Open the CSV in a text editor and verify the column headers match exactly. Check for special characters in file numbers.</li>
        <li><strong>Dashboard not loading</strong> — Check the backend API health. Review server logs for database connectivity issues.</li>
        <li><strong>Missing employee scores</strong> — Scores appear only after files are assigned. Verify that files exist and are assigned to employees via the Files tab.</li>
      </ul>

      <h2>7. Getting Support</h2>
      <p>
        For infrastructure-level issues (server downtime, database access, deployment), contact the IT infrastructure team. For application-level bugs, refer to the GitHub repository issues page or the designated technical contact for Forest eOffice.
      </p>
    </DocLayout>
  );
}
