import DocLayout from './DocLayout';

export default function TermsOfServicePage() {
  return (
    <DocLayout
      title="Terms of Service"
      subtitle="Rules governing your use of the Forest eOffice platform and the consequences of non-compliance."
      lastUpdated="May 18, 2026"
      badge="Legal Document"
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By logging into or using Forest eOffice ("the Platform"), you agree to be bound by these Terms of Service ("Terms") and all applicable Government of India and Government of Karnataka regulations. These Terms apply to all users, including Employees, Section Heads, and Administrators.
      </p>
      <p>
        If you do not agree to these Terms, you must immediately cease using the Platform and notify your system administrator.
      </p>

      <h2>2. Authorised Use</h2>
      <p>Forest eOffice is an <strong>official government system</strong>. You are authorised to use the Platform exclusively for:</p>
      <ul>
        <li>Managing government files within your assigned section and role</li>
        <li>Viewing productivity dashboards relevant to your responsibilities</li>
        <li>Communicating with the AI chatbot for operational insights</li>
        <li>Updating file statuses as part of your official duties</li>
      </ul>

      <h2>3. Prohibited Activities</h2>
      <p>You must NOT:</p>
      <ul>
        <li>Share your login credentials with any other person under any circumstances</li>
        <li>Attempt to access data or functionality beyond your authorised role</li>
        <li>Attempt to reverse-engineer, modify, or tamper with the Platform</li>
        <li>Upload files containing malware, scripts, or any non-data content via the CSV importer</li>
        <li>Use the Platform for any personal or commercial purpose unrelated to official duties</li>
        <li>Deliberately enter false data into the file management system</li>
        <li>Attempt to circumvent audit logging or session management mechanisms</li>
      </ul>
      <p>
        Violations may result in account suspension, disciplinary proceedings under the Government Servants' Conduct Rules, and referral to appropriate legal authorities.
      </p>

      <h2>4. Account Responsibilities</h2>
      <p>
        Your account is provisioned by a system administrator. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You must immediately report any suspected unauthorised access to your administrator.
      </p>

      <h2>5. Data Accuracy</h2>
      <p>
        Users are responsible for ensuring that file information entered into the system is accurate and up to date. Deliberate entry of false or misleading data constitutes a breach of official duties and may attract disciplinary action.
      </p>

      <h2>6. System Availability</h2>
      <p>
        The Platform is provided on a best-effort basis. The Karnataka Forest Department does not guarantee uninterrupted availability. Planned maintenance windows will be communicated in advance. We are not liable for any loss arising from temporary unavailability.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Platform software, design, and documentation are the intellectual property of the Karnataka Forest Department and its technology partners. Unauthorised copying, redistribution, or modification is prohibited.
      </p>

      <h2>8. Monitoring and Auditing</h2>
      <p>
        All actions performed on the Platform are logged for audit purposes. By using the Platform you consent to such monitoring, which is conducted solely for the purpose of accountability, security, and performance oversight.
      </p>

      <h2>9. Termination of Access</h2>
      <p>
        Access may be revoked at any time by an administrator for breach of these Terms, employee separation, departmental transfer, or security concerns. Upon termination, you must cease all use of the Platform immediately.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India and the State of Karnataka. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.
      </p>

      <h2>11. Amendments</h2>
      <p>
        These Terms may be updated periodically. Continued use of the Platform after any amendment constitutes acceptance of the revised Terms.
      </p>
    </DocLayout>
  );
}
