import { Layout } from "@/components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 prose prose-slate prose-headings:text-brand-forest prose-a:text-brand-sage max-w-none">
        <h1>Privacy Policy &amp; Data Processing Agreement</h1>
        <p className="text-muted-foreground">Last updated: 15 July 2026. Effective date: 15 July 2026.</p>

        <p>
          <strong>Barnett Davies Enterprises Ltd</strong> (trading as BDE Farm Trac), a company incorporated in England and Wales,
          registered office at House Barn, Moorhouses, New Bolingbroke, Boston, Lincolnshire, PE22 7JL
          (<strong>"BDE"</strong>, <strong>"we"</strong>, <strong>"us"</strong> or <strong>"our"</strong>),
          is committed to protecting your personal data and respecting your privacy.
        </p>
        <p>
          This document serves two purposes: (1) it is our <strong>Privacy Policy</strong>, explaining how we handle personal data about
          visitors to our website and individual users of BDE Farm Trac; and (2) it constitutes our
          <strong> Data Processing Agreement (DPA)</strong> for the purposes of Article 28 of the UK General Data Protection Regulation (UK GDPR),
          governing our processing of personal data on behalf of Customer businesses (controllers) who use the BDE Farm Trac platform.
        </p>
        <p>
          Please read this policy carefully. If you have any questions, contact our privacy team at{" "}
          <a href="mailto:privacy@bdefarmtrac.co.uk">privacy@bdefarmtrac.co.uk</a>.
        </p>

        <h2>1. Who We Are and Our Role</h2>
        <p>
          BDE is registered with the Information Commissioner's Office (ICO) as a data controller in relation to personal data we collect
          about website visitors and platform users (names, email addresses, account information, billing details).
        </p>
        <p>
          In relation to personal data <em>contained within</em> Customer farm records (e.g. employee names appearing in spray records,
          livestock handler names, visitor log entries), BDE acts as a <strong>data processor</strong> on behalf of the Customer,
          who is the <strong>data controller</strong>. This DPA section (Clauses 9–14) governs that processing relationship.
        </p>

        <h2>2. Data We Collect About You</h2>
        <p>We may collect and process the following categories of personal data:</p>
        <ul>
          <li><strong>Identity Data:</strong> First name, last name, business name, company number (where provided).</li>
          <li><strong>Contact Data:</strong> Email address, telephone numbers, billing address, holding address.</li>
          <li><strong>Account Data:</strong> Username, password (stored in hashed form via Clerk, our authentication provider), account preferences, and subscription details.</li>
          <li><strong>Financial Data:</strong> Payment card details (processed and stored by our payment provider — we do not store card numbers ourselves), billing history, and VAT registration number.</li>
          <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, operating system, device identifiers, and access logs.</li>
          <li><strong>Usage Data:</strong> Information about how you navigate and use our website and platform, pages viewed, features used, and session duration.</li>
          <li><strong>Communications Data:</strong> Records of correspondence with our support team, including emails and in-app chat messages.</li>
          <li><strong>Farm / Operational Data:</strong> Data entered into the platform regarding your farming operations. This may incidentally contain personal data (e.g. names of farm employees, contractors, or visitors) and is treated as Customer Data under our DPA (Section 9 below).</li>
        </ul>
        <p>
          We do not intentionally collect or process <strong>special category data</strong> (e.g. health data, biometric data) about individual users.
          If any such data is incidentally contained within Customer Data, it is held under the DPA provisions below.
        </p>

        <h2>3. How We Collect Your Data</h2>
        <ul>
          <li><strong>Direct interactions:</strong> When you register an account, complete a form, subscribe to a plan, or contact us.</li>
          <li><strong>Automated technologies:</strong> As you use our website or platform, we automatically collect Technical Data and Usage Data via cookies and server logs. See our <a href="/cookies">Cookie Policy</a> for details.</li>
          <li><strong>Third parties:</strong> We may receive limited data from our authentication provider (Clerk) and payment processor when you register or subscribe.</li>
        </ul>

        <h2>4. Lawful Basis for Processing</h2>
        <p>We rely on the following lawful bases under UK GDPR:</p>
        <ul>
          <li><strong>Contract (Article 6(1)(b)):</strong> Processing necessary to provide the BDE Farm Trac service to you and to manage your subscription.</li>
          <li><strong>Legal obligation (Article 6(1)(c)):</strong> Processing necessary to comply with our legal obligations (e.g. tax and accounting records).</li>
          <li><strong>Legitimate interests (Article 6(1)(f)):</strong> Processing for our legitimate business interests, including fraud prevention, platform security, service improvement, and marketing to existing customers — where these interests are not overridden by your rights.</li>
          <li><strong>Consent (Article 6(1)(a)):</strong> Where we send marketing communications to non-customers or set non-essential cookies, we rely on your consent, which you may withdraw at any time.</li>
        </ul>

        <h2>5. How We Use Your Data</h2>
        <p>We use your personal data to:</p>
        <ul>
          <li>Provide, operate, and maintain your BDE Farm Trac account and subscription.</li>
          <li>Process payments, issue invoices, and manage billing.</li>
          <li>Send transactional communications (account confirmations, subscription invoices, withdrawal period SMS alerts via Twilio).</li>
          <li>Provide customer support via email and our in-app AI chat assistant.</li>
          <li>Monitor and improve the security and performance of the platform.</li>
          <li>Send marketing communications about BDE Farm Trac features and updates (existing customers, legitimate interests; new contacts, with consent).</li>
          <li>Comply with our legal and regulatory obligations.</li>
          <li>Enforce our <a href="/terms">Terms of Service</a>.</li>
        </ul>

        <h2>6. Data Sharing and Sub-Processors</h2>
        <p>
          We do not sell your personal data to any third party. We share personal data only with the following trusted service providers
          (<strong>sub-processors</strong>) who process data on our behalf, each bound by appropriate data protection agreements:
        </p>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th>Sub-processor</th>
                <th>Purpose</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Replit, Inc.</strong></td>
                <td>Cloud hosting and infrastructure for the BDE Farm Trac platform</td>
                <td>United States (SCCs / UK IDTA in place)</td>
              </tr>
              <tr>
                <td><strong>Clerk, Inc.</strong></td>
                <td>User authentication and identity management</td>
                <td>United States (SCCs / UK IDTA in place)</td>
              </tr>
              <tr>
                <td><strong>Twilio, Inc.</strong></td>
                <td>SMS notifications (withdrawal period alerts, task alerts, reorder notifications)</td>
                <td>United States (SCCs / UK IDTA in place)</td>
              </tr>
              <tr>
                <td><strong>Payment processor (e.g. Stripe, Inc.)</strong></td>
                <td>Payment processing and billing</td>
                <td>United States (SCCs / UK IDTA in place)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We may also disclose your data to professional advisers (lawyers, accountants, auditors) and to law enforcement or regulatory bodies
          where required by law.
        </p>
        <p>
          We will notify you of any changes to our sub-processor list by updating this policy. Where sub-processors process data outside the UK,
          we ensure appropriate safeguards are in place, including UK International Data Transfer Agreements (IDTAs) or Standard Contractual Clauses (SCCs)
          approved by the ICO.
        </p>

        <h2>7. Data Retention</h2>
        <p>We retain your personal data for no longer than necessary:</p>
        <ul>
          <li><strong>Account and subscription data:</strong> For the duration of your subscription and for 6 years thereafter (to comply with Companies Act and HMRC requirements).</li>
          <li><strong>Farm / compliance records (Customer Data):</strong> For 5 years from the date of the record, in line with Red Tractor farm assurance guidance, or for the duration of your subscription plus 30 days — whichever is longer. After this period, Customer Data is permanently deleted unless you request an export.</li>
          <li><strong>Support communications:</strong> 3 years from the date of last contact.</li>
          <li><strong>Server logs and technical data:</strong> 12 months, then anonymised or deleted.</li>
          <li><strong>Financial records:</strong> 6 years from the end of the financial year to which they relate.</li>
        </ul>

        <h2>8. Your Rights Under UK GDPR</h2>
        <p>You have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Right to erasure ("right to be forgotten"):</strong> Request deletion of your personal data where there is no compelling reason for us to continue processing it.</li>
          <li><strong>Right to restrict processing:</strong> Request that we restrict processing of your data in certain circumstances.</li>
          <li><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format and transfer it to another controller.</li>
          <li><strong>Right to object:</strong> Object to processing based on legitimate interests, including direct marketing.</li>
          <li><strong>Rights related to automated decision-making:</strong> We do not use automated decision-making (including profiling) that produces legal or similarly significant effects without human review.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at <a href="mailto:privacy@bdefarmtrac.co.uk">privacy@bdefarmtrac.co.uk</a>.
          We will respond within one calendar month. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO)
          at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or by calling 0303 123 1113.
        </p>

        <h2>9. Data Processing Agreement — Scope</h2>
        <p>
          This section and Clauses 10–14 constitute a Data Processing Agreement between BDE (as <strong>processor</strong>) and each Customer
          (as <strong>controller</strong>) for the purposes of Article 28 UK GDPR. It applies to all personal data contained within Customer Data
          processed by BDE when providing the Service.
        </p>
        <p>
          <strong>Subject matter:</strong> The provision of the BDE Farm Trac farm management platform.<br />
          <strong>Duration:</strong> For the Subscription Term and until Customer Data is deleted in accordance with Clause 7.<br />
          <strong>Nature and purpose:</strong> Storing, organising, and making available farm compliance records as instructed by the Customer.<br />
          <strong>Type of personal data:</strong> Names of farm employees, contractors, visitors, herd handlers, and other individuals
          incidentally captured in farm compliance records.<br />
          <strong>Categories of data subjects:</strong> Customer's employees, contractors, farm visitors, and any other individuals whose names
          appear in Customer Data.
        </p>

        <h2>10. Processor Obligations</h2>
        <p>BDE, as processor, shall:</p>
        <ul>
          <li>Process Customer Data only on documented instructions from the Customer (as set out in the Terms of Service), unless required by law to do otherwise.</li>
          <li>Ensure that persons authorised to process Customer Data are bound by appropriate confidentiality obligations.</li>
          <li>Implement and maintain appropriate technical and organisational security measures (Clause 11 below).</li>
          <li>Not engage sub-processors without the Customer's general authorisation. The sub-processors listed in Clause 6 are hereby generally authorised. We will notify Customers of any new sub-processor by updating this policy, giving at least 14 days' notice where practicable.</li>
          <li>Assist the Customer with data subject rights requests, security obligations, and data protection impact assessments, to the extent reasonably practicable.</li>
          <li>On termination, delete or return all Customer Data within 30 days on request, and delete existing copies unless retention is required by law.</li>
          <li>Make available all information necessary to demonstrate compliance with Article 28 UK GDPR and allow and contribute to audits, subject to reasonable notice and confidentiality obligations.</li>
        </ul>

        <h2>11. Security Measures</h2>
        <p>BDE implements the following technical and organisational security measures:</p>
        <ul>
          <li>Encryption of data in transit (TLS 1.2+) and at rest.</li>
          <li>Role-based access controls limiting staff access to Customer Data.</li>
          <li>Multi-tenant data isolation ensuring one Customer cannot access another's data.</li>
          <li>Regular automated backups of the database.</li>
          <li>Secure development practices including dependency vulnerability scanning.</li>
          <li>Incident response procedures for security breaches.</li>
        </ul>

        <h2>12. Security Incidents</h2>
        <p>
          In the event of a personal data breach affecting Customer Data, BDE will notify the affected Customer without undue delay and in any event
          within 72 hours of becoming aware of the breach, where feasible. The notification will include the nature of the breach,
          the categories and approximate number of individuals and records affected, the likely consequences, and measures taken or proposed.
        </p>

        <h2>13. International Transfers</h2>
        <p>
          Some of our sub-processors are based outside the UK (see Clause 6). BDE ensures that all transfers of personal data to third countries
          are made in compliance with UK GDPR Chapter V, using UK International Data Transfer Agreements (IDTAs) or equivalent safeguards.
          By using the Service, you agree to these transfers on the basis of the safeguards described in this policy.
        </p>

        <h2>14. Controller Responsibilities</h2>
        <p>
          As data controller, the Customer is responsible for: (a) ensuring it has a valid lawful basis to process personal data entered into the Service;
          (b) providing appropriate privacy notices to data subjects (farm employees, contractors, etc.) whose data appears in Customer Data;
          (c) ensuring that any data entered is accurate and that data subject rights requests are handled appropriately;
          and (d) notifying BDE promptly of any data subject rights request or regulatory enquiry relating to Customer Data.
        </p>

        <h2>15. Cookies</h2>
        <p>
          We use cookies and similar tracking technologies on our website. For full details of the cookies we use and how to manage your preferences,
          please see our <a href="/cookies">Cookie Policy</a>.
        </p>

        <h2>16. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy and DPA from time to time. We will notify you of material changes by email or in-app notification
          at least 30 days before they take effect. The date at the top of this page will always reflect the most recent update.
        </p>

        <h2>Contact</h2>
        <p>
          For any privacy enquiry, to exercise a data subject right, or to raise a concern:<br />
          <strong>Data Controller:</strong> Barnett Davies Enterprises Ltd<br />
          <strong>Address:</strong> House Barn, Moorhouses, New Bolingbroke, Boston, Lincolnshire, PE22 7JL<br />
          <strong>Email:</strong> <a href="mailto:privacy@bdefarmtrac.co.uk">privacy@bdefarmtrac.co.uk</a><br />
          <strong>Telephone:</strong> 01526 341188
        </p>
        <p>
          You have the right to make a complaint to the ICO at any time. We would, however, appreciate the opportunity to deal with your concerns
          before you approach the ICO, so please contact us in the first instance.
        </p>
      </div>
    </Layout>
  );
}
