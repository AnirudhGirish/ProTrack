import DocLayout from './DocLayout';

export default function SecurityArchitecturePage() {
  return (
    <DocLayout
      title="Security Architecture"
      subtitle="A technical overview of the security controls, protocols, and layers that protect Forest eOffice and its data."
      lastUpdated="May 18, 2026"
      badge="Technical Document"
    >
      <h2>1. Security Overview</h2>
      <p>
        Forest eOffice is designed with a defence-in-depth security model. Security controls are applied at every layer of the stack — from user authentication to database access patterns — to ensure that government data is protected against both external threats and internal misuse.
      </p>

      <h2>2. Authentication</h2>
      <h3>2.1 JWT-Based Sessions</h3>
      <p>
        All authenticated sessions are managed via <strong>JSON Web Tokens (JWT)</strong> signed with an HS256 algorithm using a secret key stored only in the server's environment. Tokens carry a short expiry (24 hours by default) and are transmitted exclusively via the <code>Authorization: Bearer</code> HTTP header, never in query strings.
      </p>
      <h3>2.2 Password Security</h3>
      <p>
        User passwords are hashed using <strong>bcrypt</strong> with a work factor of 12 rounds before storage. Plaintext passwords are never stored or logged at any stage of the authentication pipeline.
      </p>
      <h3>2.3 Credential Protection</h3>
      <p>
        Failed login attempts are rate-limited at the API gateway level. There is no "forgot password" self-service to prevent account takeover — password resets are performed by administrators through the Admin Panel and must follow departmental verification procedures.
      </p>

      <h2>3. Authorisation — Role-Based Access Control (RBAC)</h2>
      <p>The Platform enforces a strict four-tier role hierarchy:</p>
      <ul>
        <li><strong>Admin</strong> — Full system access: user management, file CRUD, CSV import/export, all dashboards</li>
        <li><strong>Section Head</strong> — Read access to section-level dashboards and employee performance data</li>
        <li><strong>Employee</strong> — Access to their own assigned files only; cannot view other employees' data</li>
        <li><strong>Read Only</strong> — Dashboard and reporting access with zero write permissions</li>
      </ul>
      <p>
        Role checks are enforced at both the API router level and individual endpoint level. A user who escalates their client-side role claim will still be rejected by the server-side validation on every request.
      </p>

      <h2>4. Network and Transport Security</h2>
      <ul>
        <li><strong>TLS 1.3</strong> is enforced for all connections. TLS 1.0 and 1.1 are disabled.</li>
        <li><strong>HSTS</strong> (HTTP Strict Transport Security) headers are set with a minimum max-age of 1 year.</li>
        <li><strong>CORS</strong> is configured to allow only the official frontend origin. Wildcard origins are explicitly rejected.</li>
        <li>All API endpoints respond with security headers: <code>X-Content-Type-Options: nosniff</code>, <code>X-Frame-Options: DENY</code>, <code>Referrer-Policy: strict-origin</code>.</li>
      </ul>

      <h2>5. Data Security</h2>
      <h3>5.1 Encryption at Rest</h3>
      <p>
        The PostgreSQL database is hosted on encrypted storage volumes (AES-256). Database backups are encrypted using AES-256 before transfer to storage.
      </p>
      <h3>5.2 Input Validation and Sanitisation</h3>
      <p>
        All user inputs are validated using Pydantic schema validation on the backend. SQL injection is prevented by SQLAlchemy's parameterised query system — raw SQL string concatenation is never used. File uploads (CSV) are validated for MIME type, size limits, and content schema before processing.
      </p>
      <h3>5.3 Audit Logging</h3>
      <p>
        All state-changing operations (file creation, status updates, user creation, CSV imports) are recorded in an immutable audit log with timestamps, the acting user's ID, and the before/after state. Audit logs cannot be deleted through the application interface and are retained as per government archival requirements.
      </p>

      <h2>6. Infrastructure Security</h2>
      <ul>
        <li>The backend API is containerised with Docker and deployed on Railway with network isolation.</li>
        <li>Environment secrets (database credentials, JWT secret) are injected at runtime via Railway environment variables and are never committed to version control.</li>
        <li>Database access from the application uses a least-privilege database role with only the permissions required for operation.</li>
        <li>Dependencies are pinned and regularly audited using automated vulnerability scanning (Dependabot equivalent).</li>
      </ul>

      <h2>7. Security Testing</h2>
      <p>The Platform undergoes the following security practices:</p>
      <ul>
        <li>OWASP Top 10 review during development sprints</li>
        <li>Penetration testing before each major release</li>
        <li>Automated dependency vulnerability scanning (weekly)</li>
        <li>Manual code review with security focus for all authentication and authorisation changes</li>
      </ul>

      <h2>8. Incident Response</h2>
      <p>
        In the event of a confirmed security incident, the incident response process includes immediate account suspension for affected users, notification to the IT Security Officer within 2 hours, forensic log analysis, and a written incident report within 72 hours as required by government data handling guidelines.
      </p>

      <h2>9. Vulnerability Disclosure</h2>
      <p>
        If you discover a security vulnerability in Forest eOffice, please report it responsibly to the system administrator via official email. Do not attempt to exploit or publicly disclose vulnerabilities without prior written consent.
      </p>
    </DocLayout>
  );
}
