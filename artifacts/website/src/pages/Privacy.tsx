import { Layout } from "@/components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 prose prose-slate prose-headings:text-brand-forest prose-a:text-brand-sage max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>BDE Farm Trac Ltd ("we", "us", or "our") is committed to protecting your personal data and respecting your privacy. This policy explains how we collect, use, and share information about you when you visit our website (bdefarmtrac.co.uk) or use our SaaS application.</p>

        <h2>1. Data We Collect</h2>
        <p>We may collect and process the following data about you:</p>
        <ul>
          <li><strong>Identity Data:</strong> First name, last name, business name.</li>
          <li><strong>Contact Data:</strong> Email address, telephone numbers, billing address.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, time zone setting, location, operating system.</li>
          <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
          <li><strong>Farm Data:</strong> Data entered into our platform regarding your farming operations, which may occasionally contain personal data (e.g., employee names).</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>We use your data to:</p>
        <ul>
          <li>Provide and manage your subscription to the BDE Farm Trac platform.</li>
          <li>Process payments and manage billing.</li>
          <li>Provide customer support (including via our AI chat assistant).</li>
          <li>Improve our website, application, and services.</li>
          <li>Comply with our legal and regulatory obligations.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal data to third parties. We may share your data with trusted service providers who assist us in operating our business, such as payment processors (e.g., Stripe) and cloud hosting providers. All such third parties are required to maintain the security of your personal data.</p>

        <h2>4. Data Security</h2>
        <p>We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. We limit access to your personal data to those employees and contractors who have a business need to know.</p>

        <h2>5. Your Legal Rights</h2>
        <p>Under the UK GDPR, you have rights including:</p>
        <ul>
          <li>Request access to your personal data.</li>
          <li>Request correction of your personal data.</li>
          <li>Request erasure of your personal data.</li>
          <li>Object to processing of your personal data.</li>
        </ul>
        <p>If you wish to exercise any of these rights, please contact us at privacy@bdefarmtrac.co.uk.</p>

      </div>
    </Layout>
  );
}
