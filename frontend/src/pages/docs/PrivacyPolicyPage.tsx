import DocLayout from './DocLayout';

export default function PrivacyPolicyPage() {
  return (
    <DocLayout
      title="Privacy Policy"
      subtitle="How Forest eOffice collects, uses, and protects your personal information."
      lastUpdated="May 18, 2026"
      badge="Legal Document"
    >
      <h2>1. Introduction</h2>
      <p>
        Forest eOffice ("the Platform", "we", "our") is a productivity monitoring system operated by the Karnataka Forest Department, Government of Karnataka. This Privacy Policy describes how we collect, use, store, and protect personal information about department employees and administrators who use the Platform.
      </p>
      <p>
        By accessing or using Forest eOffice, you acknowledge that you have read and understood this Privacy Policy. If you do not agree, please do not use the Platform.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Account Information</h3>
      <p>When your account is created by an administrator, we collect:</p>
      <ul>
        <li><strong>Username</strong> — your unique login identifier within the system</li>
        <li><strong>Full name</strong> — used for display and assignment purposes</li>
        <li><strong>Employee ID</strong> — your government-issued employee identifier</li>
        <li><strong>Section/Department</strong> — the organisational unit you belong to</li>
        <li><strong>Role</strong> — your access level (Employee, Section Head, Admin)</li>
        <li><strong>Password hash</strong> — a bcrypt-hashed version of your password; plaintext is never stored</li>
      </ul>

      <h3>2.2 Activity Data</h3>
      <p>The Platform automatically records:</p>
      <ul>
        <li>File assignments, status updates, and completion events</li>
        <li>Login timestamps and session identifiers</li>
        <li>Chatbot queries and their generated responses</li>
        <li>Notification read receipts</li>
      </ul>

      <h3>2.3 Technical Data</h3>
      <p>We collect standard technical logs including IP addresses, browser type, and request timestamps solely for security auditing and troubleshooting purposes.</p>

      <h2>3. How We Use Your Information</h2>
      <p>We use collected data exclusively for the following purposes:</p>
      <ul>
        <li><strong>Productivity monitoring</strong> — generating dashboards and performance metrics for departmental oversight</li>
        <li><strong>File management</strong> — routing, assigning, and tracking government files through their lifecycle</li>
        <li><strong>Authentication and security</strong> — verifying your identity and enforcing role-based access controls</li>
        <li><strong>Notifications</strong> — alerting you to file assignments, overdue SLAs, and status changes</li>
        <li><strong>Compliance and auditing</strong> — maintaining immutable records of all system actions as required by government data governance frameworks</li>
      </ul>
      <p>We do not use your data for advertising, profiling outside the scope of work performance, or any commercial purpose.</p>

      <h2>4. Data Sharing and Disclosure</h2>
      <p>
        Your data is not sold, rented, or shared with any third party for commercial purposes. Data may be shared within the Karnataka Forest Department as needed for operational oversight. In exceptional circumstances, data may be disclosed to law enforcement or government investigative bodies as required by Indian law.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        Account and activity data is retained for the duration of your employment plus a minimum of <strong>7 years</strong> as required by Government of India record-keeping rules. Audit logs are retained permanently.
      </p>

      <h2>6. Your Rights</h2>
      <p>As a data subject under applicable Indian data protection legislation, you have the right to:</p>
      <ul>
        <li>Request access to personal data held about you</li>
        <li>Request correction of inaccurate personal data</li>
        <li>Request deletion of personal data where legally permissible</li>
        <li>Lodge a complaint with your department's Data Protection Officer</li>
      </ul>

      <h2>7. Security Measures</h2>
      <p>
        We implement industry-standard safeguards including TLS 1.3 encryption for all data in transit, bcrypt password hashing, JWT-based session management with expiry controls, and regular security audits. See our <a href="/security-architecture">Security Architecture</a> document for full technical details.
      </p>

      <h2>8. Cookies and Sessions</h2>
      <p>
        Forest eOffice uses HTTP-only, secure cookies and browser localStorage to maintain your authenticated session. No third-party tracking cookies are used.
      </p>

      <h2>9. Contact</h2>
      <p>
        For privacy-related enquiries, contact the System Administrator or the designated Data Protection Officer of the Karnataka Forest Department, Aranya Bhavan, 18th Cross, Malleshwaram, Bengaluru – 560 003.
      </p>
    </DocLayout>
  );
}
