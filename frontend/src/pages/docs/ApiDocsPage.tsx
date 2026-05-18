import DocLayout from './DocLayout';

export default function ApiDocsPage() {
  return (
    <DocLayout
      title="API Documentation"
      subtitle="REST API reference for Forest eOffice. All endpoints require a valid JWT bearer token unless otherwise noted."
      lastUpdated="May 18, 2026"
      badge="Developer Reference"
    >
      <h2>1. Overview</h2>
      <p>
        The Forest eOffice backend exposes a RESTful API built with <strong>FastAPI</strong>. All endpoints return JSON. Authentication uses <strong>Bearer token (JWT)</strong> in the <code>Authorization</code> header. The base URL for all endpoints is:
      </p>
      <pre><code>https://your-api-domain.railway.app/api/v1</code></pre>

      <h2>2. Authentication</h2>
      <h3>POST /auth/login</h3>
      <p>Obtain a JWT access token.</p>
      <p><strong>Request body (form-data):</strong></p>
      <pre><code>{`username: string\npassword: string`}</code></pre>
      <p><strong>Response 200:</strong></p>
      <pre><code>{`{\n  "access_token": "eyJ...",\n  "token_type": "bearer",\n  "role": "employee",\n  "username": "john.doe",\n  "employee_id": "EMP-001"\n}`}</code></pre>

      <h3>GET /auth/me</h3>
      <p>Get the currently authenticated user's profile. Requires Bearer token.</p>
      <pre><code>{`{\n  "id": "uuid",\n  "username": "john.doe",\n  "full_name": "John Doe",\n  "role": "employee",\n  "section": "Legal & Land",\n  "employee_id": "EMP-001",\n  "is_active": true\n}`}</code></pre>

      <h3>POST /auth/logout</h3>
      <p>Invalidate the current session. Requires Bearer token.</p>

      <h2>3. Dashboard</h2>
      <h3>GET /dashboard</h3>
      <p>Retrieve organisation-wide productivity metrics. Requires Admin or Section Head role.</p>
      <pre><code>{`{\n  "total_files": 1284,\n  "completed": 1089,\n  "pending": 195,\n  "completion_rate": 84.8,\n  "section_breakdown": [\n    { "section": "Legal & Land", "total": 320, "completed": 294, "pending": 26 }\n  ],\n  "underperforming_sections": [],\n  "employee_scores": [\n    { "employee_id": "EMP-001", "employee_name": "John Doe", "total": 42,\n      "completed": 39, "pending": 3, "productivity_score": 92.8 }\n  ],\n  "old_pending_files": [],\n  "insights": ["Legal & Land section achieved 92% this week."]\n}`}</code></pre>

      <h2>4. Files</h2>
      <h3>GET /files</h3>
      <p>List files with optional filtering. Query params: <code>section</code>, <code>status</code>, <code>priority</code>, <code>page</code>, <code>page_size</code> (max 200).</p>

      <h3>POST /files</h3>
      <p>Create a file. Admin role required.</p>
      <pre><code>{`{\n  "file_no": "KF/LL/2024/001",\n  "subject": "Land encroachment case",\n  "section": "Legal & Land",\n  "priority": "high",\n  "status": "received",\n  "created_date": "2024-01-15"\n}`}</code></pre>

      <h3>PATCH /files/{'{file_id}'}/status</h3>
      <p>Update a file's status. The requesting user must be the current assignee or an Admin.</p>
      <pre><code>{`{ "status": "in_progress" }`}</code></pre>

      <h3>DELETE /files/{'{file_id}'}</h3>
      <p>Permanently delete a file. Admin role required.</p>

      <h2>5. Employee Endpoints</h2>
      <h3>GET /employee/tasks</h3>
      <p>List all files assigned to the authenticated employee.</p>

      <h3>GET /employee/summary</h3>
      <p>Get the authenticated employee's task summary (total, completed, pending).</p>

      <h2>6. Admin Endpoints</h2>
      <h3>GET /admin/stats</h3>
      <p>System-wide statistics (total files, users, completion counts). Admin role required.</p>

      <h3>GET /admin/users</h3>
      <p>List all users. Admin role required. Query params: <code>page</code>, <code>page_size</code>.</p>

      <h3>POST /admin/users</h3>
      <p>Create a new user. Admin role required.</p>
      <pre><code>{`{\n  "username": "jane.doe",\n  "password": "securePassword123",\n  "role": "employee",\n  "full_name": "Jane Doe",\n  "employee_id": "EMP-042",\n  "section": "Revenue Department"\n}`}</code></pre>

      <h3>POST /admin/import-csv</h3>
      <p>Import files from a CSV. Admin role required. Multipart form upload with field <code>file</code>.</p>

      <h3>GET /admin/export-csv</h3>
      <p>Export all file data as CSV. Admin role required. Returns <code>text/csv</code>.</p>

      <h2>7. Notifications</h2>
      <h3>GET /notifications</h3>
      <p>List notifications for the authenticated user. Query params: <code>page_size</code> (default 20).</p>

      <h3>GET /notifications/count</h3>
      <p>Get unread notification count. Returns: <code>{`{ "unread": 3 }`}</code></p>

      <h3>PATCH /notifications/{'{id}'}/read</h3>
      <p>Mark a notification as read.</p>

      <h3>POST /notifications/mark-all-read</h3>
      <p>Mark all notifications for the user as read.</p>

      <h2>8. Chatbot</h2>
      <h3>POST /chatbot/query</h3>
      <p>Submit a natural language query to the AI assistant. Requires authentication.</p>
      <pre><code>{`{ "query": "Which sections have the most pending files?" }`}</code></pre>
      <pre><code>{`{ "response": "The Wildlife Division has 76 pending files, followed by Revenue Department with 54..." }`}</code></pre>

      <h2>9. Error Responses</h2>
      <p>All errors follow this structure:</p>
      <pre><code>{`{ "detail": "Human-readable error message" }`}</code></pre>
      <ul>
        <li><code>400</code> — Bad request / validation error</li>
        <li><code>401</code> — Missing or invalid token</li>
        <li><code>403</code> — Insufficient role permissions</li>
        <li><code>404</code> — Resource not found</li>
        <li><code>422</code> — Request body validation failed</li>
        <li><code>500</code> — Internal server error</li>
      </ul>

      <h2>10. Rate Limiting</h2>
      <p>
        API endpoints are rate-limited at 100 requests per minute per authenticated user. Login endpoints are limited to 10 requests per minute per IP address to prevent brute-force attacks.
      </p>
    </DocLayout>
  );
}
