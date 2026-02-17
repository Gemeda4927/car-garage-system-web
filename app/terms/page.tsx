"use client";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Terms & Privacy Policy
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Please read our terms and privacy
            policy carefully before using
            SmartGarage.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: February 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 space-y-10 border border-white/40">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using SmartGarage,
              you agree to comply with and be
              bound by these Terms and Conditions.
              If you do not agree with any part of
              these terms, you must not use our
              platform.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              2. User Accounts
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Users are responsible for
              maintaining the confidentiality of
              their account credentials. You agree
              to provide accurate and complete
              information when registering and to
              update it as necessary.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              3. Booking & Payments
            </h2>
            <p className="text-gray-700 leading-relaxed">
              SmartGarage connects users with
              verified garages. We are not
              directly responsible for service
              quality. Payments processed through
              our system must comply with our
              booking policies.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              4. Cancellation Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Users may cancel appointments within
              the allowed timeframe. Late
              cancellations may result in service
              fees depending on the garage policy.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              5. Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We collect personal information such
              as name, email, and booking details
              to provide our services. Your data
              is securely stored and never sold to
              third parties.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              6. Data Protection
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement security measures to
              protect your personal data. However,
              no online system is 100% secure, and
              users share data at their own risk.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              SmartGarage is not liable for
              indirect, incidental, or
              consequential damages arising from
              the use of our services.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these
              terms at any time. Continued use of
              the platform constitutes acceptance
              of the updated terms.
            </p>
          </section>

          {/* Footer Note */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © 2026 SmartGarage. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
