import DocLayout from './DocLayout';

export default function DataProcessingAgreementPage() {
  return (
    <DocLayout
      title="Data Processing Agreement"
      subtitle="Agreement governing how personal data is processed within Forest eOffice in compliance with applicable data protection laws."
      lastUpdated="May 18, 2026"
      badge="Legal Document"
    >
      <h2>1. Parties and Scope</h2>
      <p>
        This Data Processing Agreement ("DPA") is between the <strong>Karnataka Forest Department, Government of Karnataka</strong> ("Data Controller") and the designated technology service provider responsible for maintaining the Forest eOffice platform infrastructure ("Data Processor"). This DPA forms part of, and is subject to, the main service agreement between the parties.
      </p>
      <p>
        This DPA applies to all personal data processed by the Processor on behalf of the Controller in connection with the Forest eOffice platform, as described in Annex I.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Personal Data</strong> — any information relating to an identified or identifiable natural person, including employee names, usernames, employee IDs, and activity logs</li>
        <li><strong>Processing</strong> — any operation performed on Personal Data, including collection, storage, retrieval, use, disclosure, and deletion</li>
        <li><strong>Data Breach</strong> — any accidental or unlawful destruction, loss, alteration, or unauthorised disclosure of Personal Data</li>
      </ul>

      <h2>3. Processing Instructions</h2>
      <p>
        The Processor shall process Personal Data only on documented instructions from the Controller. The Processor shall not process Personal Data for any purpose other than the operation and maintenance of the Forest eOffice platform as defined in the service agreement.
      </p>
      <p>
        The Processor shall immediately inform the Controller if, in its opinion, an instruction infringes applicable data protection law.
      </p>

      <h2>4. Processor Obligations</h2>
      <p>The Processor shall:</p>
      <ul>
        <li>Ensure that all personnel authorised to process Personal Data are bound by appropriate confidentiality obligations</li>
        <li>Implement and maintain technical and organisational security measures as described in the Security Architecture document</li>
        <li>Not engage any sub-processor without prior written authorisation from the Controller</li>
        <li>Assist the Controller in responding to data subject requests within 72 hours of receipt</li>
        <li>Notify the Controller of any Data Breach within 24 hours of becoming aware of it</li>
        <li>Delete or return all Personal Data upon termination of the service agreement, at the Controller's election</li>
        <li>Make available all information necessary to demonstrate compliance with this DPA and permit audits by the Controller or its designated auditor</li>
      </ul>

      <h2>5. Technical and Organisational Measures</h2>
      <p>The Processor implements the following measures:</p>
      <ul>
        <li>AES-256 encryption for data at rest on all database volumes</li>
        <li>TLS 1.3 for all data in transit between client, server, and database</li>
        <li>bcrypt (cost factor 12) password hashing; no plaintext credentials stored</li>
        <li>Role-based access control ensuring users access only data within their authorised scope</li>
        <li>Immutable audit logging for all data modification events</li>
        <li>Regular automated security vulnerability scanning of all dependencies</li>
        <li>Database backups encrypted and retained for a minimum of 30 days</li>
      </ul>

      <h2>6. Data Subject Rights</h2>
      <p>
        The Processor shall assist the Controller in fulfilling its obligations to respond to requests from data subjects exercising their rights under applicable law. Where a data subject contacts the Processor directly, the Processor shall forward the request to the Controller within 24 hours.
      </p>

      <h2>7. International Data Transfers</h2>
      <p>
        Personal Data processed under this DPA shall not be transferred outside India except with explicit written authorisation from the Controller and subject to appropriate safeguards as required by Indian data protection law.
      </p>

      <h2>8. Duration and Termination</h2>
      <p>
        This DPA remains in force for the duration of the service agreement. Upon termination, the Processor shall, at the Controller's election, either return all Personal Data in a portable format or securely delete it within 30 days, providing written confirmation of deletion.
      </p>

      <h2>9. Liability</h2>
      <p>
        Each party's liability under this DPA is subject to the limitations set out in the main service agreement. The Processor shall be liable for damages caused by processing that does not comply with this DPA or that is carried out contrary to lawful instructions of the Controller.
      </p>

      <h2>Annex I — Description of Processing</h2>
      <ul>
        <li><strong>Nature of processing:</strong> Storage, retrieval, display, and analysis of employee and file data for productivity monitoring purposes</li>
        <li><strong>Purpose:</strong> Government departmental file management and employee performance monitoring</li>
        <li><strong>Types of Personal Data:</strong> Names, usernames, employee IDs, section assignments, file activity records, login timestamps</li>
        <li><strong>Categories of data subjects:</strong> Karnataka Forest Department employees and administrators</li>
        <li><strong>Retention period:</strong> Duration of employment plus 7 years; audit logs retained permanently</li>
      </ul>
    </DocLayout>
  );
}
