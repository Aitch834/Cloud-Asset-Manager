import { Layout } from "@/components/layout/Layout";

export default function Cookies() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 prose prose-slate prose-headings:text-brand-forest prose-a:text-brand-sage max-w-none">
        <h1>Cookie Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>Our website uses cookies to distinguish you from other users. This helps us provide you with a good experience when you browse our website and allows us to improve our site.</p>

        <h2>What are cookies?</h2>
        <p>A cookie is a small file of letters and numbers that we store on your browser or the hard drive of your computer if you agree. Cookies contain information that is transferred to your computer's hard drive.</p>

        <h2>Cookies we use</h2>
        <p>We use the following types of cookies:</p>
        <ul>
          <li><strong>Strictly necessary cookies:</strong> These are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website.</li>
          <li><strong>Analytical/performance cookies:</strong> They allow us to recognise and count the number of visitors and to see how visitors move around our website. This helps us improve the way our website works.</li>
          <li><strong>Functionality cookies:</strong> These are used to recognise you when you return to our website. This enables us to personalise our content for you and remember your preferences.</li>
        </ul>

        <h2>Managing your cookies</h2>
        <p>You can manage your cookie preferences through the banner that appears when you first visit our site. You can also block cookies by activating the setting on your browser that allows you to refuse the setting of all or some cookies. However, if you use your browser settings to block all cookies (including essential cookies), you may not be able to access all or parts of our site.</p>
      </div>
    </Layout>
  );
}
