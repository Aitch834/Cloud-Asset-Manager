import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function NDA() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <h1 className="text-3xl font-bold text-brand-forest">Mutual Non-Disclosure Agreement</h1>
            <p className="text-muted-foreground mt-2">
              Download or print this document, complete the parties' details, and have both parties sign before exchanging any confidential information.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>

        <div className="prose prose-slate prose-headings:text-brand-forest prose-a:text-brand-sage max-w-none print:prose-sm">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wide">Mutual Non-Disclosure Agreement</h1>
            <p className="text-muted-foreground text-sm mt-1">Governed by the Law of England and Wales</p>
          </div>

          <p>
            This Mutual Non-Disclosure Agreement (<strong>"Agreement"</strong>) is entered into as of the date last signed below
            (<strong>"Effective Date"</strong>) between:
          </p>

          <div className="border border-slate-200 rounded-lg p-6 my-6 space-y-4 bg-slate-50 not-prose">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Party 1 (Disclosing / Receiving)</p>
              <p className="font-semibold text-brand-forest">Barnett Davies Enterprises Ltd</p>
              <p className="text-sm text-slate-600">trading as BDE Farm Trac</p>
              <p className="text-sm text-slate-600">House Barn, Moorhouses, New Bolingbroke, Boston, Lincolnshire, PE22 7JL</p>
              <p className="text-sm text-slate-600">(<strong>"BDE"</strong> or <strong>"Party 1"</strong>)</p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Party 2 (Disclosing / Receiving)</p>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Full legal name: <span className="inline-block min-w-48 border-b border-slate-300">&nbsp;</span></p>
                <p className="text-sm text-slate-400">Registered address: <span className="inline-block min-w-48 border-b border-slate-300">&nbsp;</span></p>
                <p className="text-sm text-slate-400">Company/registration number (if applicable): <span className="inline-block min-w-40 border-b border-slate-300">&nbsp;</span></p>
                <p className="text-sm text-slate-400">(<strong>"Counterparty"</strong> or <strong>"Party 2"</strong>)</p>
              </div>
            </div>
          </div>

          <p>
            BDE and the Counterparty are each referred to as a <strong>"Party"</strong> and collectively as the <strong>"Parties"</strong>.
          </p>

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
            that is designated as confidential, or that reasonably should be understood to be confidential given the nature of the information
            and the circumstances of disclosure. Confidential Information includes, but is not limited to:
          </p>
          <ul>
            <li>business plans, strategies, projections, and financial information;</li>
            <li>technical data, trade secrets, know-how, source code, algorithms, and software architectures;</li>
            <li>customer lists, supplier information, pricing structures, and commercial terms;</li>
            <li>product designs, specifications, roadmaps, and development plans;</li>
            <li>intellectual property, whether registered or unregistered;</li>
            <li>personnel information and organisational structures;</li>
            <li>the existence, nature, and terms of this Agreement and the discussions between the Parties.</li>
          </ul>

          <h2>2. Exclusions</h2>
          <p>Confidential Information does not include information that the Receiving Party can demonstrate:</p>
          <ul>
            <li>is or becomes publicly known or available through no breach of this Agreement by the Receiving Party;</li>
            <li>was already known to the Receiving Party before disclosure, as evidenced by written records pre-dating this Agreement;</li>
            <li>is received from a third party who is not under any confidentiality obligation with respect to such information;</li>
            <li>is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information; or</li>
            <li>is required to be disclosed by applicable law, regulation, or court order — provided that the Receiving Party gives the Disclosing Party as much prior written notice as is reasonably practicable and co-operates reasonably with any attempt by the Disclosing Party to seek a protective order.</li>
          </ul>

          <h2>3. Obligations of the Receiving Party</h2>
          <p>The Receiving Party agrees to:</p>
          <ul>
            <li>hold the Confidential Information in strict confidence using at least the same degree of care it uses to protect its own confidential information, and in no event less than reasonable care;</li>
            <li>use the Confidential Information solely for the Purpose and for no other purpose whatsoever;</li>
            <li>not disclose, publish, copy, or distribute any Confidential Information to any third party without the Disclosing Party's prior written consent;</li>
            <li>limit access to the Confidential Information to its employees, officers, directors, professional advisers, and contractors who: (a) have a genuine need to know for the Purpose; and (b) are bound by written confidentiality obligations at least as protective as those in this Agreement;</li>
            <li>notify the Disclosing Party promptly and in writing upon becoming aware of any actual or suspected unauthorised disclosure or use of Confidential Information; and</li>
            <li>take all reasonable steps to prevent any further unauthorised disclosure or use following such notification.</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            Nothing in this Agreement grants the Receiving Party any licence, right, title, or interest in or to any Confidential Information
            or any intellectual property of the Disclosing Party. All Confidential Information remains the sole and exclusive property of the Disclosing Party.
            No licence under any patent, trade mark, copyright, database right, or other intellectual property right is granted by this Agreement,
            whether expressly, by implication, estoppel, or otherwise.
          </p>
          <p>
            The Receiving Party acknowledges that the Disclosing Party's Confidential Information may include trade marks (including "BDE Farm Trac"
            and associated marks) and that no right to use such marks is granted by this Agreement.
          </p>

          <h2>5. Return or Destruction of Information</h2>
          <p>
            Upon written request by the Disclosing Party at any time, or upon expiry or termination of this Agreement, the Receiving Party shall,
            at the Disclosing Party's election, promptly return or securely destroy all Confidential Information (including all copies, notes,
            extracts, and summaries) and certify in writing that it has done so. The Receiving Party may retain one archival copy solely for the
            purposes of legal compliance, subject to the continuing obligations of this Agreement.
          </p>

          <h2>6. No Warranty</h2>
          <p>
            All Confidential Information is provided "as is". The Disclosing Party makes no representation or warranty, express or implied,
            as to the accuracy, completeness, or fitness for any purpose of the Confidential Information.
            The Disclosing Party shall have no liability to the Receiving Party for any reliance on the Confidential Information.
          </p>

          <h2>7. Remedies</h2>
          <p>
            Each Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages
            alone would be an inadequate remedy. Accordingly, the Disclosing Party shall be entitled to seek injunctive relief, specific performance,
            or other equitable relief in addition to any other remedies available at law or in equity, without the need to post a bond or other security
            or to prove actual damages.
          </p>

          <h2>8. Term</h2>
          <p>
            This Agreement shall commence on the Effective Date and shall continue for a period of <strong>two (2) years</strong>,
            unless terminated earlier by either Party on 30 days' written notice to the other.
          </p>
          <p>
            The obligations of confidentiality in respect of Confidential Information disclosed during the Term shall survive expiry or
            termination of this Agreement for a further period of <strong>five (5) years</strong> from the date of disclosure of the relevant information.
            For information that constitutes a trade secret under applicable law, the obligations shall continue for as long as the information
            remains a trade secret.
          </p>

          <h2>9. No Obligation to Proceed</h2>
          <p>
            This Agreement does not obligate either Party to proceed with any transaction, partnership, investment, or commercial relationship.
            Either Party may at any time, in its sole discretion and without liability, decide not to proceed with the Purpose.
            Nothing in this Agreement shall be construed to create an agency, partnership, joint venture, or employment relationship between the Parties.
          </p>

          <h2>10. Entire Agreement and Amendments</h2>
          <p>
            This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior
            or contemporaneous agreements, understandings, or discussions (whether written or oral) relating to confidentiality between the Parties.
            This Agreement may not be amended or modified except by a written instrument signed by duly authorised representatives of both Parties.
          </p>

          <h2>11. Severability and Waiver</h2>
          <p>
            If any provision of this Agreement is found by a court of competent jurisdiction to be unenforceable, that provision shall be severed
            and the remaining provisions shall continue in full force and effect.
            No failure or delay by either Party in exercising any right under this Agreement shall constitute a waiver of that right.
          </p>

          <h2>12. Governing Law and Jurisdiction</h2>
          <p>
            This Agreement and any dispute or claim (including non-contractual disputes or claims) arising out of or in connection with it
            shall be governed by and construed in accordance with the law of <strong>England and Wales</strong>.
            Each Party irrevocably submits to the exclusive jurisdiction of the courts of England and Wales to settle any such dispute or claim.
          </p>

          <h2>13. Notices</h2>
          <p>
            All notices under this Agreement shall be in writing and delivered by email (with read receipt requested) or by recorded post to the
            addresses set out on the signature page below. Notices take effect on confirmed delivery.
          </p>

          <div className="mt-12 border-t-2 border-slate-300 pt-8">
            <h2 className="text-center">Signatures</h2>
            <p>
              Each Party confirms that it has read, understood, and agrees to be bound by this Agreement.
              This Agreement may be executed in counterparts, each of which shall constitute an original, and together shall constitute one and the same instrument.
              Electronic signatures (including DocuSign, Adobe Sign, or equivalent) are accepted and shall be legally binding.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 not-prose">
              <div className="space-y-6">
                <p className="font-semibold text-brand-forest text-sm uppercase tracking-wide">For and on behalf of Party 1<br/>Barnett Davies Enterprises Ltd</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Authorised Signatory</p>
                    <div className="border-b-2 border-slate-400 h-10 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Printed Name</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Title / Position</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Date</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email address (for notices)</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="font-semibold text-brand-forest text-sm uppercase tracking-wide">For and on behalf of Party 2<br/>Counterparty</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Authorised Signatory</p>
                    <div className="border-b-2 border-slate-400 h-10 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Printed Name</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Title / Position</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Date</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Email address (for notices)</p>
                    <div className="border-b border-slate-300 h-8 w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 not-prose">
              <strong>Note:</strong> This document is provided as a template by BDE Farm Trac for general commercial use.
              It is not legal advice. For complex transactions, significant commercial relationships, or where substantial sums are involved,
              you should have this document reviewed by a qualified solicitor before use.
            </div>
          </div>

        </div>

        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { font-size: 11pt; }
            h1, h2 { page-break-after: avoid; }
          }
        `}</style>
      </div>
    </Layout>
  );
}
