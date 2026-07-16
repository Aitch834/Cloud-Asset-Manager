import { Printer, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NDA() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <FileSignature className="w-6 h-6 text-primary shrink-0" />
          <div>
            <h1 className="text-xl font-bold">Mutual Non-Disclosure Agreement</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Internal template — complete the party details and print or save as PDF before sending for signature.
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-6 print:hidden">
        <strong>Internal use only.</strong> This template is for BDE staff. Fill in the Counterparty details below before printing or sending.
        For significant commercial relationships, have a solicitor review before use.
      </div>

      <div className="bg-white border rounded-lg p-10 prose prose-slate prose-headings:text-slate-800 prose-sm max-w-none print:border-0 print:shadow-none print:p-0">

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase tracking-wide not-prose text-slate-800">Mutual Non-Disclosure Agreement</h1>
          <p className="text-slate-500 text-sm mt-1 not-prose">Governed by the Law of England and Wales</p>
        </div>

        <p>
          This Mutual Non-Disclosure Agreement (<strong>"Agreement"</strong>) is entered into as of the date last signed below
          (<strong>"Effective Date"</strong>) between:
        </p>

        <div className="not-prose border border-slate-200 rounded-lg p-6 my-6 bg-slate-50 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Party 1</p>
            <p className="font-semibold text-slate-800">Barnett Davies Enterprises Ltd</p>
            <p className="text-sm text-slate-600">trading as BDE Farm Trac</p>
            <p className="text-sm text-slate-600">House Barn, Moorhouses, New Bolingbroke, Boston, Lincolnshire, PE22 7JL</p>
            <p className="text-sm text-slate-500 mt-1">(<strong>BDE</strong> or <strong>Party 1</strong>)</p>
          </div>
          <div className="border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Party 2 — complete before printing</p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Full legal name: <span className="inline-block min-w-64 border-b border-slate-400 ml-1">&nbsp;</span></p>
              <p>Registered address: <span className="inline-block min-w-64 border-b border-slate-400 ml-1">&nbsp;</span></p>
              <p className="pl-24"><span className="inline-block min-w-72 border-b border-slate-400">&nbsp;</span></p>
              <p>Company / reg. number (if applicable): <span className="inline-block min-w-48 border-b border-slate-400 ml-1">&nbsp;</span></p>
              <p className="text-slate-500 mt-2">(<strong>Counterparty</strong> or <strong>Party 2</strong>)</p>
            </div>
          </div>
        </div>

        <p>BDE and the Counterparty are each referred to as a <strong>"Party"</strong> and together as the <strong>"Parties"</strong>.</p>

        <h2>Background</h2>
        <p>
          The Parties wish to explore, discuss, or pursue a potential business relationship or transaction (<strong>"Purpose"</strong>).
          In connection with the Purpose, each Party may disclose to the other certain confidential and proprietary information.
          The Parties wish to protect such information in accordance with the terms of this Agreement.
        </p>

        <h2>1. Definition of Confidential Information</h2>
        <p>
          <strong>"Confidential Information"</strong> means any and all non-public information disclosed by one Party (<strong>"Disclosing Party"</strong>)
          to the other Party (<strong>"Receiving Party"</strong>) — whether orally, in writing, electronically, visually, or in any other form —
          that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and
          the circumstances of disclosure. Confidential Information includes, without limitation:
        </p>
        <ul>
          <li>business plans, strategies, financial projections, and pricing information;</li>
          <li>technical data, trade secrets, know-how, source code, algorithms, database schemas, and software architectures;</li>
          <li>customer lists, supplier information, and commercial terms;</li>
          <li>product designs, specifications, roadmaps, and development plans;</li>
          <li>intellectual property, whether registered or unregistered (including the trade marks "BDE Farm Trac" and associated marks);</li>
          <li>personnel information and organisational structures; and</li>
          <li>the existence, nature, and terms of this Agreement and all discussions between the Parties.</li>
        </ul>

        <h2>2. Exclusions</h2>
        <p>Confidential Information does not include information that the Receiving Party can demonstrate by written evidence:</p>
        <ul>
          <li>is or becomes publicly known or available through no breach of this Agreement by the Receiving Party;</li>
          <li>was already known to the Receiving Party before disclosure under this Agreement;</li>
          <li>is received from a third party who is under no confidentiality obligation regarding such information;</li>
          <li>is independently developed by the Receiving Party without reference to the Disclosing Party's Confidential Information; or</li>
          <li>is required to be disclosed by law, regulation, or court order — provided the Receiving Party gives the Disclosing Party as much prior written notice as reasonably practicable and co-operates with any effort to seek a protective order.</li>
        </ul>

        <h2>3. Obligations of the Receiving Party</h2>
        <p>The Receiving Party agrees to:</p>
        <ul>
          <li>hold the Confidential Information in strict confidence using at least the same degree of care it uses for its own confidential information, and in no event less than reasonable care;</li>
          <li>use the Confidential Information solely for the Purpose and for no other purpose;</li>
          <li>not disclose, copy, or distribute any Confidential Information to any third party without the Disclosing Party's prior written consent;</li>
          <li>limit access to those employees, officers, professional advisers, and contractors who have a genuine need to know for the Purpose and who are bound by written confidentiality obligations at least as protective as those in this Agreement;</li>
          <li>notify the Disclosing Party promptly upon becoming aware of any actual or suspected unauthorised disclosure or use; and</li>
          <li>take all reasonable steps to prevent further unauthorised disclosure or use following such notification.</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>
          Nothing in this Agreement grants the Receiving Party any licence, right, title, or interest in or to any Confidential Information or
          any intellectual property of the Disclosing Party. All Confidential Information remains the sole and exclusive property of the Disclosing Party.
          No licence under any patent, trade mark, copyright, database right, or other intellectual property right is granted, whether expressly,
          by implication, estoppel, or otherwise.
        </p>

        <h2>5. Return or Destruction of Information</h2>
        <p>
          Upon written request by the Disclosing Party at any time, or upon expiry or termination of this Agreement, the Receiving Party shall
          promptly return or securely destroy all Confidential Information (including all copies, notes, extracts, and summaries) and certify
          in writing that it has done so. One archival copy may be retained solely for legal compliance, subject to the continuing obligations of this Agreement.
        </p>

        <h2>6. No Warranty</h2>
        <p>
          All Confidential Information is provided "as is". The Disclosing Party makes no representation or warranty as to its accuracy,
          completeness, or fitness for any purpose, and shall have no liability arising from the Receiving Party's reliance on it.
        </p>

        <h2>7. Remedies</h2>
        <p>
          Each Party acknowledges that breach of this Agreement may cause irreparable harm for which monetary damages alone would be an inadequate remedy.
          Accordingly, the Disclosing Party shall be entitled to seek injunctive relief, specific performance, or other equitable relief in addition
          to any other remedies available at law or in equity, without the need to post a bond or prove actual damages.
        </p>

        <h2>8. Term</h2>
        <p>
          This Agreement commences on the Effective Date and continues for <strong>two (2) years</strong>, unless terminated earlier by either Party on 30 days' written notice.
          Confidentiality obligations in respect of information disclosed during the Term shall survive for a further <strong>five (5) years</strong> from the date of disclosure.
          For information constituting a trade secret under applicable law, obligations continue for as long as the information remains a trade secret.
        </p>

        <h2>9. No Obligation to Proceed</h2>
        <p>
          This Agreement does not obligate either Party to proceed with any transaction, partnership, investment, or commercial relationship.
          Either Party may, in its sole discretion and without liability, decide not to proceed with the Purpose at any time.
          Nothing herein creates an agency, partnership, joint venture, or employment relationship between the Parties.
        </p>

        <h2>10. Entire Agreement and Amendments</h2>
        <p>
          This Agreement constitutes the entire agreement between the Parties on the subject of confidentiality and supersedes all prior discussions
          and agreements relating thereto. It may not be amended except by a written instrument signed by authorised representatives of both Parties.
        </p>

        <h2>11. Severability and Waiver</h2>
        <p>
          If any provision is found unenforceable, it shall be severed and the remaining provisions shall continue in full force.
          No failure or delay in exercising any right constitutes a waiver of that right.
        </p>

        <h2>12. Governing Law and Jurisdiction</h2>
        <p>
          This Agreement and any dispute arising out of or in connection with it (including non-contractual disputes) shall be governed by
          and construed in accordance with the law of <strong>England and Wales</strong>. Each Party irrevocably submits to the exclusive
          jurisdiction of the courts of England and Wales.
        </p>

        <h2>13. Notices</h2>
        <p>
          Notices shall be in writing and delivered by email (with read receipt) or recorded post to the addresses on the signature block below.
          Notices take effect on confirmed delivery.
        </p>

        <div className="border-t-2 border-slate-300 mt-10 pt-8">
          <h2 className="text-center">Signatures</h2>
          <p>
            Each Party confirms it has read, understood, and agrees to be bound by this Agreement.
            This Agreement may be executed in counterparts, each constituting an original.
            Electronic signatures (e.g. DocuSign, Adobe Sign) are accepted and shall be legally binding.
          </p>

          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">For and on behalf of Party 1<br/>Barnett Davies Enterprises Ltd</p>
              <div className="space-y-4 text-sm">
                {[
                  "Authorised Signatory",
                  "Printed Name",
                  "Title / Position",
                  "Date",
                  "Email address (for notices)",
                ].map((label) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <div className={`border-b ${label === "Authorised Signatory" ? "border-slate-500 border-b-2 h-10" : "border-slate-300 h-8"} w-full`} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">For and on behalf of Party 2<br/>Counterparty</p>
              <div className="space-y-4 text-sm">
                {[
                  "Authorised Signatory",
                  "Printed Name",
                  "Title / Position",
                  "Date",
                  "Email address (for notices)",
                ].map((label) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <div className={`border-b ${label === "Authorised Signatory" ? "border-slate-500 border-b-2 h-10" : "border-slate-300 h-8"} w-full`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 11pt; background: white; }
          h2 { page-break-after: avoid; }
        }
      `}</style>
    </div>
  );
}
