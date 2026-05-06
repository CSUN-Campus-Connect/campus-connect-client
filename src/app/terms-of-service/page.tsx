export default function TermsOfServicePage() {
  const lastUpdated = "May 3, 2026";

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#fff", minHeight: "100vh", color: "#111827" }}>
      {/* Header */}
      <div style={{ background: "#B11226", padding: "48px 0 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Campus Connect</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Terms of Service</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, margin: 0 }}>Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: "#374151", marginBottom: 40, borderLeft: "3px solid #B11226", paddingLeft: 16 }}>
          These Terms of Service govern your use of Campus Connect. By creating an account or using the platform, you agree to these terms. Campus Connect is an independent platform and is not affiliated with or operated by California State University, Northridge. Please read these terms carefully.
        </p>

        <Section title="1. Eligibility">
          <p>To use Campus Connect, you must have a valid <strong>@my.csun.edu</strong> email address. By registering, you confirm that:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>You are an enrolled CSUN student, faculty member, or university affiliate with a valid @my.csun.edu email</li>
            <li>You are at least 13 years of age</li>
            <li>You have not previously been removed from Campus Connect for violating these Terms</li>
            <li>Your use of Campus Connect complies with all applicable laws</li>
          </ul>
          <p>We reserve the right to verify eligibility and suspend accounts that do not meet these requirements.</p>
        </Section>

        <Section title="2. Your Account">
          <p>You are responsible for your account and everything that happens under it. Specifically, you agree to:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>Keep your password secure and not share it with others</li>
            <li>Use your real name and accurate information when registering</li>
            <li>Notify us immediately if you suspect unauthorized access to your account</li>
            <li>Not create multiple accounts or impersonate another person</li>
          </ul>
          <p>You may view and revoke active login sessions at any time from <strong>Settings → Security</strong>.</p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>Campus Connect is a community platform. You agree to use it respectfully and lawfully. You may <strong>not</strong> use Campus Connect to:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>Post content that is abusive, harassing, threatening, defamatory, or discriminatory based on race, gender, religion, nationality, sexual orientation, disability, or any other protected characteristic</li>
            <li>Share explicit, pornographic, or sexually exploitative content of any kind</li>
            <li>Post or distribute spam, advertisements, or unsolicited promotional material</li>
            <li>Share misinformation, impersonate others, or create fake identities</li>
            <li>Upload or distribute malware, viruses, or any harmful code</li>
            <li>Scrape, harvest, or collect other users' data without their consent</li>
            <li>Attempt to gain unauthorized access to accounts, servers, or data</li>
            <li>Use the platform for any illegal activity or to facilitate illegal conduct</li>
            <li>Bully, stalk, or intimidate other users</li>
          </ul>
          <p>We reserve the right to remove content and suspend or permanently ban accounts that violate these rules, at our sole discretion.</p>
        </Section>

        <Section title="4. Content You Post">
          <SubSection title="4.1 Ownership">
            <p>You retain ownership of content you post on Campus Connect — your posts, messages, profile information, and marketplace listings belong to you. By posting content, you grant Campus Connect a non-exclusive, royalty-free license to store, display, and distribute that content as necessary to operate the platform.</p>
          </SubSection>
          <SubSection title="4.2 Responsibility">
            <p>You are solely responsible for the content you post. Campus Connect does not pre-screen content, but we reserve the right to review, remove, or restrict content that violates these Terms or our community guidelines.</p>
          </SubSection>
          <SubSection title="4.3 Removal">
            <p>You may delete your own posts at any time. Deleted content is removed from public view immediately but may be temporarily retained for moderation and safety purposes as described in our Privacy Policy before being permanently purged.</p>
          </SubSection>
        </Section>

        <Section title="5. Marketplace">
          <p>Campus Connect includes a peer-to-peer marketplace where users can list items for sale, rent, or free. When using the marketplace:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>You are solely responsible for the accuracy and legality of your listings</li>
            <li>Transactions are conducted directly between users — Campus Connect does not process payments, hold funds, or guarantee transactions</li>
            <li>You may not list illegal items, stolen goods, controlled substances, weapons, or counterfeit products</li>
            <li>All disputes between buyers and sellers are the responsibility of the parties involved</li>
          </ul>
          <p>Campus Connect is not a party to any transaction and accepts no liability for the outcome of marketplace exchanges.</p>
        </Section>

        <Section title="6. Messaging">
          <p>Direct messages and group conversations on Campus Connect are intended for personal communication between users. You agree not to use messaging to harass, spam, or send unsolicited content to other users. Users you have blocked cannot send you messages. Violations of the messaging rules may result in account suspension.</p>
        </Section>

        <Section title="7. Safety and Reporting">
          <p>Campus Connect includes tools to help keep the community safe:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li><strong>Report content</strong> — you can report posts, comments, or users that violate these Terms</li>
            <li><strong>Block users</strong> — blocking prevents another user from viewing your profile or contacting you</li>
            <li><strong>Safety reports</strong> — for serious safety concerns, you can file a safety report including an optional location and evidence files</li>
          </ul>
          <p>We take reports seriously and review them in good faith. In cases involving credible threats to safety, we may share relevant information with campus security or law enforcement.</p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>All software, design, branding, and original content created by Campus Connect — including the name, logo, and user interface — is the intellectual property of Campus Connect. You may not copy, reproduce, modify, or distribute any part of the platform without written permission.</p>
          <p>If you believe content on Campus Connect infringes your copyright, please contact us at <strong>support@campusconnect.com</strong> with details of the alleged infringement.</p>
        </Section>

        <Section title="9. Privacy">
          <p>Your use of Campus Connect is also governed by our <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "#B11226" }}>Privacy Policy</a>, which explains what data we collect, how we use it, and your rights. By using Campus Connect, you agree to our data practices as described in that policy.</p>
        </Section>

        <Section title="10. Disclaimers">
          <p>Campus Connect is provided <strong>"as is"</strong> without warranties of any kind, express or implied. We do not guarantee that the platform will be available at all times, free of errors, or secure from unauthorized access. We are not responsible for:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#374151" }}>
            <li>Content posted by users</li>
            <li>The outcome of marketplace transactions between users</li>
            <li>Loss of data due to technical failures</li>
            <li>Actions taken by other users on the platform</li>
          </ul>
          <p>Campus Connect is not affiliated with California State University, Northridge, and CSUN bears no responsibility for the platform or its content.</p>
        </Section>

        <Section title="11. Termination">
          <p>You may delete your account at any time from <strong>Settings → Account → Danger Zone</strong>. Upon deletion, your personal data is removed within 30 days except where retention is required for safety or legal reasons, as described in our Privacy Policy.</p>
          <p>We may suspend or permanently terminate your account without notice if you violate these Terms, engage in conduct that harms other users or the platform, or if required to do so by law.</p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>We may update these Terms as the platform evolves. When we do, we will update the "Last updated" date at the top of this page and notify users via an in-app announcement. Continued use of Campus Connect after changes are posted constitutes acceptance of the updated Terms.</p>
          <p>If you disagree with updated Terms, you may delete your account before the changes take effect.</p>
        </Section>

        <Section title="13. Contact">
          <p>If you have questions about these Terms or want to report a concern, contact us:</p>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "16px 20px", marginTop: 12 }}>
            <p style={{ margin: 0, lineHeight: 2 }}>
              <strong>Campus Connect</strong><br/>
              Email: <a href="mailto:support@campusconnect.com" style={{ color: "#B11226" }}>support@campusconnect.com</a>
            </p>
          </div>
        </Section>

        <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 48, paddingTop: 24, color: "#9CA3AF", fontSize: 13, textAlign: "center" }}>
          © {new Date().getFullYear()} Campus Connect · Independent platform, not affiliated with CSUN
        </div>
      </div>
    </div>
  );
}

// Helper components
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
