export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{background: '#f8f7ff'}}>
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">🦉</span>
          <div>
            <h1 className="text-3xl font-black" style={{color: '#1a1a2e'}}>Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Last updated: June 2026</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-purple-50 prose prose-gray max-w-none">

          <p className="text-gray-600 leading-relaxed mb-6">
            Unique Owl ("we", "us", or "our") operates the Unique Owl application and website at uniqueowl.com. 
            This Privacy Policy explains how we collect, use, and protect your information when you use our service.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-3">When you create an account, we collect:</p>
          <ul className="text-gray-600 space-y-2 mb-6 list-disc pl-6">
            <li>Your name</li>
            <li>Email address</li>
            <li>Country of residence</li>
            <li>Password (stored securely using encryption)</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mb-6">
            When you use the app, we collect your game activity including words submitted, scores, and attempt counts.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>2. How We Use Your Information</h2>
          <ul className="text-gray-600 space-y-2 mb-6 list-disc pl-6">
            <li>To provide and operate the Unique Owl service</li>
            <li>To display your name and score on the leaderboard</li>
            <li>To send password reset emails when requested</li>
            <li>To process payments for premium features via Stripe</li>
            <li>To improve our service and user experience</li>
          </ul>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>3. Data Storage & Security</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Your data is stored securely on servers hosted by Render (render.com). Passwords are encrypted using 
            industry-standard bcrypt hashing. We use JWT tokens for secure authentication. We do not store your 
            payment card details — all payments are processed securely by Stripe.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>4. Third Party Services</h2>
          <p className="text-gray-600 leading-relaxed mb-3">We use the following third-party services:</p>
          <ul className="text-gray-600 space-y-2 mb-6 list-disc pl-6">
            <li><strong>Stripe</strong> — for payment processing. Stripe's privacy policy applies to payment data.</li>
            <li><strong>Google AdSense/AdMob</strong> — for displaying advertisements. Google may use cookies to serve relevant ads.</li>
            <li><strong>Gmail</strong> — for sending transactional emails (password resets).</li>
            <li><strong>Render</strong> — for hosting our servers and database.</li>
          </ul>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>5. Cookies</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We use local storage (similar to cookies) to keep you logged in. Google AdSense may use cookies 
            to personalise advertisements. You can opt out of personalised ads through Google's ad settings.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>6. Your Rights (GDPR)</h2>
          <p className="text-gray-600 leading-relaxed mb-3">If you are in the UK or EU, you have the right to:</p>
          <ul className="text-gray-600 space-y-2 mb-6 list-disc pl-6">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mb-6">
            To exercise any of these rights, contact us at <strong>privacy@uniqueowl.com</strong>
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>7. Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Unique Owl is not directed at children under 13. We do not knowingly collect personal information 
            from children under 13. If you believe a child has provided us with personal information, 
            please contact us and we will delete it.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>8. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We retain your account data for as long as your account is active. If you request account deletion, 
            we will delete your personal data within 30 days. Game data (words submitted) may be retained 
            in anonymised form.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>9. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes 
            by email or by posting a notice on our website. Continued use of the service after changes 
            constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-xl font-black mt-8 mb-3" style={{color: '#1a1a2e'}}>10. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have any questions about this Privacy Policy, please contact us at:<br/>
            <strong>Email:</strong> privacy@uniqueowl.com<br/>
            <strong>Website:</strong> uniqueowl.com
          </p>

        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-sm font-semibold" style={{color: '#7F77DD'}}>← Back to Unique Owl</a>
        </div>
      </div>
    </div>
  );
}
