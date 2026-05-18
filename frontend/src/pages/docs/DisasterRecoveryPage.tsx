import DocLayout from './DocLayout';

export default function DisasterRecoveryPage() {
  return (
    <DocLayout
      title="Disaster Recovery Plan"
      subtitle="Procedures for restoring Forest eOffice services and data following a significant disruption or failure."
      lastUpdated="May 18, 2026"
      badge="Operational Document"
    >
      <h2>1. Purpose and Scope</h2>
      <p>
        This Disaster Recovery Plan ("DRP") describes the procedures to be followed in the event of a significant system failure, data loss, or security incident affecting the Forest eOffice platform. The objective is to restore full operations with minimum data loss, in the shortest possible time, and with no permanent loss of government file records.
      </p>

      <h2>2. Recovery Objectives</h2>
      <ul>
        <li><strong>Recovery Time Objective (RTO)</strong> — Target: 4 hours for full service restoration after a declared disaster.</li>
        <li><strong>Recovery Point Objective (RPO)</strong> — Target: Maximum 24 hours of data loss. Daily automated backups ensure no more than one day of data is at risk.</li>
        <li><strong>Maximum Tolerable Downtime (MTD)</strong> — 72 hours before escalation to senior departmental management.</li>
      </ul>

      <h2>3. Backup Strategy</h2>
      <h3>3.1 Database Backups</h3>
      <ul>
        <li><strong>Frequency:</strong> Automated daily full database backups at 02:00 IST</li>
        <li><strong>Retention:</strong> 30 days of daily backups retained in encrypted cloud storage</li>
        <li><strong>Encryption:</strong> AES-256 encryption applied to all backup files before upload</li>
        <li><strong>Location:</strong> Railway managed backup service with geographic redundancy</li>
        <li><strong>Verification:</strong> Monthly automated restore tests to verify backup integrity</li>
      </ul>
      <h3>3.2 Application Code</h3>
      <p>
        All application source code is version-controlled on GitHub. Any version can be deployed within 30 minutes from a clean environment.
      </p>

      <h2>4. Disaster Classification</h2>
      <ul>
        <li><strong>Level 1 — Minor:</strong> Single service degradation (e.g., API slowness). Handled by on-call engineer. No formal DRP invocation required.</li>
        <li><strong>Level 2 — Moderate:</strong> Complete service unavailability for &gt; 1 hour. DRP invoked. IT team notified. Target restoration: 4 hours.</li>
        <li><strong>Level 3 — Severe:</strong> Data loss confirmed or security breach suspected. DRP invoked. IT Security Officer, Department Head, and legal team notified immediately.</li>
      </ul>

      <h2>5. Recovery Procedures</h2>
      <h3>5.1 Service Unavailability (Level 2)</h3>
      <ol>
        <li>IT team diagnoses root cause via infrastructure dashboards and application logs</li>
        <li>If infrastructure failure: re-deploy from latest Docker image on Railway</li>
        <li>If database failure: restore from most recent verified backup</li>
        <li>Verify system health via API health endpoint (<code>/health</code>)</li>
        <li>Notify department administrator of restoration and any data loss window</li>
      </ol>

      <h3>5.2 Data Loss Event (Level 3)</h3>
      <ol>
        <li>Immediately suspend write operations and preserve current state</li>
        <li>Identify the extent of data loss via audit logs and backup timestamps</li>
        <li>Restore database from the most recent clean backup prior to the loss event</li>
        <li>Replay any available audit log entries to recover post-backup changes</li>
        <li>Conduct a reconciliation review with department records to identify any irrecoverable gaps</li>
        <li>Prepare and submit an incident report within 72 hours</li>
      </ol>

      <h3>5.3 Security Breach (Level 3)</h3>
      <ol>
        <li>Immediately invalidate all active JWT sessions (rotate JWT secret key)</li>
        <li>Suspend all user accounts pending investigation</li>
        <li>Preserve all logs in a read-only state for forensic analysis</li>
        <li>Engage IT Security Officer and legal counsel</li>
        <li>Notify affected users and relevant authorities within 72 hours as required by law</li>
        <li>Re-deploy from a known-clean image after forensic review is complete</li>
        <li>Re-onboard users with fresh credentials after identity verification</li>
      </ol>

      <h2>6. Communication Plan</h2>
      <ul>
        <li>System Administrator notifies Department Head within 1 hour of Level 2+ incidents</li>
        <li>IT Security Officer notified immediately for Level 3 incidents</li>
        <li>All users notified of planned maintenance and estimated restoration times via email</li>
        <li>Post-incident summary report delivered to Department Head within 5 working days</li>
      </ul>

      <h2>7. Testing and Review</h2>
      <p>
        This DRP is reviewed and updated annually or after any significant infrastructure change. A tabletop exercise simulating a Level 2 or Level 3 disaster is conducted annually to validate procedures and team readiness. Results are documented and used to improve this plan.
      </p>

      <h2>8. Contact Directory</h2>
      <ul>
        <li><strong>System Administrator:</strong> Primary point of contact for all incidents</li>
        <li><strong>IT Security Officer:</strong> Karnataka Forest Department IT Security, Aranya Bhavan</li>
        <li><strong>Infrastructure Support:</strong> Railway.app support portal for hosting emergencies</li>
        <li><strong>Database Support:</strong> Supabase support portal for database emergencies</li>
      </ul>
    </DocLayout>
  );
}
