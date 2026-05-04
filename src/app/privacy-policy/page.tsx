export default function PrivacyPolicyPage() {
  const lastUpdated = "May 3, 2026";

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#fff", minHeight: "100vh", color: "#111827" }}>
      {/* Header */}
      <div style={{ background: "#B11226", padding: "48px 0 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Campus Connect</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Privacy Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, margin: 0 }}>Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: "#374151", marginBottom: 40, borderLeft: "3px solid #B11226", paddingLeft: 16 }}>
          Campus Connect is a social platform built for the CSUN student community. This Privacy Policy describes exactly what personal data we currently collect, why we collect it, how it is used, and the rights you have over your information. Campus Connect is an independent platform and is not affiliated with or operated by California State University, Northridge. We only describe features and data collection that are actively in use.
        </p>

        <Section title="1. Who We Are">
          <p>Campus Connect is an independent platform built for the CSUN student community. Campus Connect is not affiliated with or operated by California State University, Northridge. For privacy-related questions or data requests, contact us at <strong>support@campusconnect.com</strong>.</p>
        </Section>

        <Section title="2. Who Can Use Campus Connect">
          <p>Registration requires a valid <strong>@my.csun.edu</strong> email address. Your email is verified before your account becomes active, limiting access to the CSUN community.</p>
        </Section>

        <Section title="3. Data We Collect and Store">
          <p>The following is an accurate list of personal data currently stored in our database, organized by category.</p>

          <SubSection title="3.1 Account & Identity Data">
            <p>Collected when you register or update your account:</p>
            <DataTable rows={[
              ["Full name", "First and last name"],
              ["Email address", "Your @my.csun.edu address, used for login and verification"],
              ["Password", "Stored as a one-way bcrypt hash — your plaintext password is never stored or transmitted"],
              ["User type", "Whether you are a student, faculty, or alumni"],
              ["Phone number", "Optional — stored only if you opt into emergency alerts"],
              ["Emergency alerts opt-in", "Whether you have opted in to receive emergency notifications via SMS"],

              ["Expo push token", "A device-level identifier used to deliver push notifications to your device; updated when you log in on a new device"],
              ["Email verification status", "Whether your email has been confirmed"],
              ["Account creation date", "Timestamp of when your account was created"],
              ["Last active timestamp", "The last time activity was recorded on your account"],
              ["Password reset token", "A short-lived token generated when you request a password reset; expires after use"],
            ]}/>
          </SubSection>

          <SubSection title="3.2 Profile Data">
            <p>Collected when you fill out your profile (all fields are optional except name and email):</p>
            <DataTable rows={[
              ["Profile picture", "A URL pointing to your uploaded profile image"],
              ["Bio", "A short description of yourself (max 250 characters)"],
              ["City", "Your city (max 50 characters)"],
              ["Websites", "Up to 5 website URLs you choose to display on your profile"],
            ]}/>
          </SubSection>

          <SubSection title="3.3 Session & Login Data">
            <p>Collected automatically each time you log in, to secure your account and detect unauthorized access:</p>
            <DataTable rows={[
              ["Session ID", "A unique identifier for each active login session"],
              ["Device label", "A human-readable description of the device used (e.g., 'Chrome on Windows')"],
              ["IP address", "The IP address associated with the login event or active session"],
              ["Approximate location", "City and region derived from your IP address at login time"],
              ["Session timestamps", "When each session was created, last used, and when it expires"],
              ["Login history", "A log of past logins including device label, IP address, approximate location, and timestamp"],
            ]}/>
            <p>You can view and revoke your active sessions at any time from <strong>Settings → Security</strong>.</p>
          </SubSection>

          <SubSection title="3.4 Content You Create">
            <p>Stored when you interact with the platform:</p>
            <DataTable rows={[
              ["Posts", "Text content and image URLs you publish, including whether a post is a repost and any repost comment; creation and update timestamps are stored"],
              ["Comments", "Replies you leave on posts, with timestamps"],
              ["Likes", "Records of which posts you have liked"],
              ["Reposts", "Records of posts you have reshared"],
              ["Livestreams", "Livestreams you host, including title, viewer count, and start and end times"],
            ]}/>
          </SubSection>

          <SubSection title="3.5 Messaging Data">
            <DataTable rows={[
              ["Conversations", "Direct message and group conversations you participate in; group conversations also store a group name and optional group picture"],
              ["Messages", "The text content of messages you send, timestamps, and whether a message has been edited or soft-deleted"],
              ["Message reactions", "Emoji reactions you add to messages"],
              ["Message attachments", "Files you send in conversations, stored with file name, type, size, and a URL to the stored file"],
            ]}/>
            <p>Note: messages you delete are marked as deleted but may be temporarily retained for moderation and safety purposes before being permanently removed.</p>
          </SubSection>

          <SubSection title="3.6 Marketplace Data">
            <DataTable rows={[
              ["Listings", "Items you post for sale, rent, or free — including title, description, price, condition, category, location, images, and listing status"],
              ["Favorites", "Items you have saved in the marketplace"],
            ]}/>
          </SubSection>

          <SubSection title="3.7 Settings & Preferences">
            <DataTable rows={[
              ["Notification preferences", "Your on/off settings for clubs, events, marketplace, academic, and connection-request notifications"],
              ["Privacy preferences", "Who can view your profile, who can message you, and whether tagging is allowed"],
              ["Appearance preferences", "Your selected theme (light/dark) and text size"],
              ["Pinned conversations", "Which message threads you have pinned"],
              ["Chat backgrounds", "Any custom chat background settings you have configured"],
              ["Blocked users", "A list of user IDs you have blocked"],
            ]}/>
          </SubSection>

          <SubSection title="3.8 Reports & Moderation">
            <p>Collected when you submit a report or when moderation actions involve your account:</p>
            <DataTable rows={[
              ["Content reports", "Reports you submit about posts, comments, users, or marketplace listings — including the reason, optional description, and resolution status"],
              ["Bug reports", "Technical issues you report, including title, category, severity, description, reproduction steps, and browser information; any file attachments are stored as URLs"],
              ["Security/safety reports", "Safety incidents you report, including type, urgency, title, description, incident date, and a text description of the location"],
              ["Location coordinates", "If you choose to provide a precise location when filing a security report, the latitude and longitude are stored alongside the report"],
              ["Anonymous reports", "If you file a report anonymously, a tracking token is stored instead of your user ID — your identity is not linked to the report"],
              ["Involved parties", "Names, descriptions, and affiliations of people you identify as involved in a security report"],
              ["Evidence files", "Files you upload as evidence, stored with file metadata and a SHA-256 checksum for integrity verification"],
              ["Moderation actions", "Any moderation decisions taken in relation to content you reported or your own account"],
            ]}/>
          </SubSection>

          <SubSection title="3.9 Announcements">
            <DataTable rows={[
              ["Delivery records", "Which campus-wide announcements have been sent to you and via which channel (in-app banner, push notification, email, or SMS)"],
              ["Dismissals", "Which announcements you have dismissed in the app"],
            ]}/>
          </SubSection>
        </Section>

        <Section title="4. Data We Do Not Currently Collect">
          <p>The following are planned features that exist in our system architecture but are <strong>not yet active</strong> — no data is being collected for them at this time:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>Academic records (student ID, major, GPA, graduation year)</li>
            <li>Faculty or alumni professional information</li>
            <li>Friend and connection relationships</li>
            <li>Club memberships (user-facing club features are not yet live)</li>
          </ul>
          <p>We also do not collect:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>Continuous or real-time location data (location is only stored when you explicitly include it in a security report)</li>
            <li>Browsing history outside of Campus Connect</li>
            <li>Contacts, calendar, microphone, or camera data</li>
            <li>Biometric data of any kind</li>
            <li>Payment or financial information</li>
            <li>Data from third-party advertising networks — we run no ads</li>
          </ul>
        </Section>

        <Section title="5. How We Use Your Data">
          <p>We use the data we collect solely to operate and improve Campus Connect:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li><strong>Authentication & security</strong> — to verify your identity, manage login sessions, and detect unauthorized access</li>
            <li><strong>Platform functionality</strong> — to display your profile, show your posts and messages, and power features like the marketplace</li>
            <li><strong>Push notifications</strong> — to send you timely notifications using your device push token, based on your preferences</li>
            <li><strong>Emergency alerts</strong> — if you opt in, your phone number may be used to deliver campus emergency notifications via SMS</li>
            <li><strong>Safety & moderation</strong> — to review reports, take action on content that violates community guidelines, and support campus safety functions</li>
            <li><strong>Bug fixes & improvements</strong> — to understand and resolve technical issues you report</li>
          </ul>
          <p>We do not sell your data, use it for advertising, or share it with third parties for marketing purposes.</p>
        </Section>

        <Section title="6. Data Sharing">
          <p>We do not sell or rent your personal data. Data is shared only in these limited circumstances:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li><strong>Within the platform</strong> — your public profile information is visible to other Campus Connect users according to your privacy settings</li>
            <li><strong>Infrastructure providers</strong> — we use cloud hosting and database providers to store and serve your data securely</li>
            <li><strong>Push notification services</strong> — your device push token is used with Expo's push notification infrastructure to deliver in-app notifications</li>
            <li><strong>Email & SMS providers</strong> — announcement delivery uses SendGrid (email) and Twilio (SMS) when you are sent emergency or campus-wide alerts</li>
            <li><strong>Legal requirements</strong> — we may disclose information if required by law, court order, or to protect the safety of users or the campus community</li>
            <li><strong>Law enforcement & safety</strong> — in the event of a serious safety concern, relevant data (including security report contents and any location coordinates you provided) may be shared with campus security or law enforcement</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <DataTable rows={[
            ["Account & profile data", "Retained while your account is active"],
            ["Session data", "Active sessions expire automatically; login history is retained for 90 days"],
            ["Posts, comments, and content", "Retained until you delete them or your account is deleted"],
            ["Messages and attachments", "Retained until deleted by participants or upon account deletion; soft-deleted messages are purged within 30 days"],
            ["Marketplace listings", "Retained until you remove them or your account is deleted"],
            ["Security & safety reports", "Retained for administrative and legal purposes even after account deletion, in accordance with campus safety requirements"],
            ["Bug reports", "Retained for up to 1 year after resolution"],
            ["Deleted accounts", "Personal data is permanently removed within 30 days of account deletion, except where retention is required for safety or legal reasons"],
          ]}/>
        </Section>

        <Section title="8. Your Rights & Controls">
          <p>You have the following controls available directly in the app:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li><strong>Edit your profile</strong> — update your name, bio, picture, and other profile fields at any time</li>
            <li><strong>Manage sessions</strong> — view and revoke active login sessions from <strong>Settings → Security</strong></li>
            <li><strong>Privacy controls</strong> — control who can view your profile and message you from <strong>Settings → Privacy</strong></li>
            <li><strong>Block users</strong> — block accounts from <strong>Settings → Privacy → Blocked Users</strong></li>
            <li><strong>Notification preferences</strong> — customize which notifications you receive from <strong>Settings → Notifications</strong></li>
            <li><strong>Change your password</strong> — update your password from <strong>Settings → Account</strong></li>
            <li><strong>Delete your account</strong> — permanently delete your account and all associated data from <strong>Settings → Account → Danger Zone</strong></li>
          </ul>
          <p>To request a copy of your data or raise a privacy concern not addressed by in-app controls, contact us at <strong>support@campusconnect.com</strong>.</p>
        </Section>

        <Section title="9. Local Storage">
          <p>Campus Connect stores a cached copy of your profile data and preferences in your browser's local storage to improve load times. This mirrors what is in our database and is cleared when you log out. We do not use third-party tracking cookies or advertising cookies.</p>
        </Section>

        <Section title="10. Security">
          <p>We take the following measures to protect your data:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>Passwords are hashed using bcrypt and are never stored or transmitted in plaintext</li>
            <li>Authentication uses short-lived JWT access tokens paired with refresh tokens</li>
            <li>All login sessions are tracked individually and can be revoked remotely by you at any time</li>
            <li>Evidence files are stored with SHA-256 checksums to verify file integrity</li>
            <li>Access to sensitive operations requires a valid, authenticated session</li>
          </ul>
          <p>No system is completely secure. If you believe your account has been compromised, revoke your sessions immediately from <strong>Settings → Security</strong> and change your password.</p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>Campus Connect is intended for users with a valid @my.csun.edu email address. We do not knowingly collect data from anyone under the age of 13. Because registration requires a university email address, access is effectively limited to college-age users.</p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>We may update this Privacy Policy as new features are introduced or existing ones change. When we do, we will update the "Last updated" date at the top of this page and notify users via an in-app announcement. Continued use of Campus Connect after changes are posted constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="13. Contact">
          <p>If you have questions about this Privacy Policy or how your data is handled, please contact us:</p>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "16px 20px", marginTop: 12 }}>
            <p style={{ margin: 0, lineHeight: 2 }}>
              <strong>Campus Connect</strong><br/>
              Email: <a href="mailto:support@campusconnect.com" style={{ color: "#B11226" }}>support@campusconnect.com</a>
            </p>
          </div>
        </Section>

        <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 48, paddingTop: 24, color: "#9CA3AF", fontSize: 13, textAlign: "center" }}>
          © {new Date().getFullYear()} Campus Connect · Not affiliated with CSUN
        </div>
      </div>
    </div>
  );
}

//  Helper components 
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 20,
        fontWeight: 800,
        color: "#111827",
        margin: "0 0 12px",
        paddingBottom: 8,
        borderBottom: "2px solid #F3F4F6",
        letterSpacing: "-0.01em",
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.75, color: "#374151" }}>
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "20px 0 8px" }}>{title}</h3>
      {children}
    </div>
  );
}

function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 12 }}>
      <tbody>
        {rows.map(([field, description], i) => (
          <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
            <td style={{
              padding: "9px 12px 9px 0",
              fontWeight: 600,
              color: "#111827",
              whiteSpace: "nowrap",
              verticalAlign: "top",
              width: "34%",
            }}>
              {field}
            </td>
            <td style={{ padding: "9px 0", color: "#6B7280", verticalAlign: "top" }}>
              {description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
