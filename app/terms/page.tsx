export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{background: '#f8f7ff'}}>
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">🦉</span>
          <div>
            <h1 className="text-3xl font-black" style={{color: '#1a1a2e'}}>Terms of Service</h1>
            <p className="text-gray-400 text-sm">Last updated: June 2026</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-purple-50">

          <p className="text-gray-600 leading-relaxed mb-6">
            By using Unique Owl, you agree to these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>1. Use of Service</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Unique Owl is a word originality game. You must be at least 13 years old to use this service. 
            You are responsible for maintaining the security of your account and password.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>2. Acceptable Use</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You agree not to:</p>
          <ul className="text-gray-600 space-y-2 mb-6 list-disc pl-6">
            <li>Use automated bots or scripts to submit words</li>
            <li>Attempt to manipulate or cheat the scoring system</li>
            <li>Submit offensive, hateful, or illegal content</li>
            <li>Attempt to hack, disrupt, or damage the service</li>
            <li>Create multiple accounts to gain unfair advantages</li>
          </ul>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>3. Payments</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Premium attempt packs are one-time purchases. All payments are processed by Stripe. 
            We do not offer refunds for purchased attempt packs once they have been added to your account. 
            All prices are in GBP and include applicable taxes.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>4. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The Unique Owl name, logo, and application are owned by us. Words submitted by users 
            become part of the shared word database. You retain no ownership over submitted words.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>5. Disclaimers</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Unique Owl is provided "as is" without warranties of any kind. We do not guarantee 
            uninterrupted access to the service. We reserve the right to modify or discontinue 
            the service at any time.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>6. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            To the maximum extent permitted by law, Unique Owl shall not be liable for any indirect, 
            incidental, or consequential damages arising from your use of the service.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>7. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            These terms are governed by the laws of England and Wales. Any disputes shall be 
            resolved in the courts of England and Wales.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>8. Contact</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            For questions about these terms, contact us at <strong>legal@uniqueowl.com</strong>
          </p>

        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-sm font-semibold" style={{color: '#7F77DD'}}>← Back to Unique Owl</a>
        </div>
      </div>
    </div>
  );
}
