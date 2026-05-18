import DocLayout from './DocLayout';

export default function UserManualPage() {
  return (
    <DocLayout
      title="User Manual"
      subtitle="A complete guide for department employees on using Forest eOffice effectively."
      lastUpdated="May 18, 2026"
      badge="End User Guide"
    >
      <h2>1. Getting Started</h2>
      <h3>1.1 Accessing the Platform</h3>
      <p>
        Open your web browser (Google Chrome or Mozilla Firefox recommended) and navigate to the Forest eOffice URL provided by your administrator. The platform works on both desktop and mobile browsers.
      </p>

      <h3>1.2 Logging In</h3>
      <p>
        On the Sign In page, enter the <strong>username</strong> and <strong>password</strong> assigned to you by your system administrator. Click <strong>Sign In</strong>. If your credentials are correct, you will be redirected to the Dashboard.
      </p>
      <p>
        If you cannot log in, verify that your Caps Lock key is off and that you are entering the exact username given to you. Passwords are case-sensitive. Contact your administrator if you continue to face issues — there is no self-service password reset.
      </p>

      <h3>1.3 Logging Out</h3>
      <p>
        Click your name/avatar in the top-right corner of the screen and select <strong>Sign Out</strong>. Always log out when using a shared computer. Sessions expire automatically after 24 hours of inactivity.
      </p>

      <h2>2. The Dashboard</h2>
      <p>
        The Dashboard is your starting point. It displays organisation-wide productivity statistics and lets you quickly grasp the health of all departments:
      </p>
      <ul>
        <li><strong>Total Files</strong> — total number of files registered in the system</li>
        <li><strong>Completed</strong> — files that have been fully closed</li>
        <li><strong>Pending</strong> — files still in progress or awaiting action</li>
        <li><strong>Completion Rate</strong> — percentage of files completed out of total</li>
      </ul>
      <p>
        The <strong>Section-wise Performance</strong> chart shows completion and pending counts for each department. <strong>Underperforming Sections</strong> are highlighted in red where the backlog rate exceeds the acceptable threshold. The <strong>Employee Leaderboard</strong> shows productivity scores for each colleague.
      </p>
      <p>
        Click <strong>Refresh</strong> (top-right of the dashboard) to fetch the latest data at any time.
      </p>

      <h2>3. My Tasks</h2>
      <p>
        Navigate to <strong>My Tasks</strong> from the top navigation bar to see all files assigned to you. This is your primary work queue.
      </p>
      <h3>3.1 Understanding File Statuses</h3>
      <ul>
        <li><strong>Received</strong> — file has been assigned to you; begin work</li>
        <li><strong>In Progress</strong> — you are actively working on the file</li>
        <li><strong>Under Review</strong> — file has been submitted for your section head's review</li>
        <li><strong>Returned</strong> — file was returned with comments; revise and resubmit</li>
        <li><strong>Approved</strong> — file has been approved; pending final closure</li>
        <li><strong>Closed</strong> — file workflow is complete</li>
      </ul>

      <h3>3.2 Updating a File Status</h3>
      <p>
        In the <strong>Update Status</strong> column, use the dropdown to move a file to the next valid status. Only permissible transitions are shown (e.g., you cannot skip from Received directly to Approved). After selecting a status, the change is saved immediately and a success notification appears.
      </p>
      <p>
        Note: Files in <strong>Closed</strong> status cannot be updated. Contact your administrator if a closed file needs to be reopened.
      </p>

      <h3>3.3 Priority and Due Dates</h3>
      <p>
        Files are colour-coded by priority: <strong>Critical</strong> (red), <strong>High</strong> (amber), <strong>Normal</strong> (blue), <strong>Low</strong> (grey). Due dates marked in red indicate the file is overdue — these should be actioned first.
      </p>

      <h2>4. Notifications</h2>
      <p>
        The bell icon in the top navigation shows your unread notification count. Navigate to <strong>Notifications</strong> to see all your notifications, including:
      </p>
      <ul>
        <li>New file assignments</li>
        <li>Files returned by reviewers</li>
        <li>SLA overdue alerts</li>
        <li>Status change confirmations</li>
      </ul>
      <p>Click <strong>Mark Read</strong> on individual notifications or <strong>Mark All Read</strong> to clear all at once.</p>

      <h2>5. AI Chatbot</h2>
      <p>
        A floating chatbot button appears in the bottom-right corner while you are logged in. Click it to open the chat panel and ask questions in plain English, such as:
      </p>
      <ul>
        <li>"What is the completion rate for the Legal & Land section this week?"</li>
        <li>"Which employees have the most pending files?"</li>
        <li>"Show me files pending for more than 30 days."</li>
      </ul>
      <p>
        The chatbot has access to all live productivity data and generates answers in real time. It cannot make changes to any data — it is a read-only analytical assistant.
      </p>

      <h2>6. Tips for Effective Use</h2>
      <ul>
        <li>Update file statuses on the same day you complete each stage — this keeps the department's metrics accurate</li>
        <li>Check the Dashboard first thing each morning to identify any critical overdue files</li>
        <li>Use the chatbot to quickly find answers without navigating multiple screens</li>
        <li>If a due date is unrealistic, contact your Section Head to have it adjusted through the Admin Panel</li>
        <li>Never share your password — each action in the system is permanently associated with your account</li>
      </ul>

      <h2>7. Getting Help</h2>
      <p>
        If you encounter a technical issue, contact your system administrator. For questions about file procedures or departmental policies, contact your Section Head. This manual is updated periodically — always refer to the version on the platform for the latest guidance.
      </p>
    </DocLayout>
  );
}
