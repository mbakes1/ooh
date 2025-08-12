/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Digital Billboard Marketplace",
  description: "Privacy policy for the Digital Billboard Marketplace platform",
};

export default function PrivacyPolicyPage() {
  return (
    // eslint-disable-next-line react/no-unescaped-entities
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString("en-ZA")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Digital Billboard Marketplace ("we," "our," or "us") is committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use
            our digital billboard marketplace platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Information We Collect
          </h2>

          <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
          <p>We may collect the following personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and business name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Business address</li>
            <li>Profile information and preferences</li>
            <li>
              Payment information (processed securely by third-party providers)
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Usage Information</h3>
          <p>
            We automatically collect information about how you use our platform:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our platform</li>
            <li>Search queries and interactions</li>
            <li>Location data (with your consent)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and maintain our marketplace services</li>
            <li>Process transactions and communications</li>
            <li>Improve our platform and user experience</li>
            <li>Send important updates and notifications</li>
            <li>Comply with legal obligations</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Information Sharing and Disclosure
          </h2>
          <p>
            We do not sell your personal information. We may share your
            information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              With other users as necessary for marketplace functionality (e.g.,
              contact information for inquiries)
            </li>
            <li>With service providers who assist in operating our platform</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or acquisition</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure data storage and backup procedures</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Your Rights (POPIA Compliance)
          </h2>
          <p>
            Under South Africa's Protection of Personal Information Act (POPIA),
            you have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access your personal information</li>
            <li>Correct or update your information</li>
            <li>Delete your personal information</li>
            <li>Object to processing of your information</li>
            <li>Data portability</li>
            <li>Lodge a complaint with the Information Regulator</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Cookies and Tracking
          </h2>
          <p>
            We use cookies and similar technologies to enhance your experience.
            You can control cookie preferences through your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
          <p>
            We retain your personal information only as long as necessary to
            fulfill the purposes outlined in this policy or as required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            9. International Transfers
          </h2>
          <p>
            Your information may be transferred to and processed in countries
            other than South Africa. We ensure appropriate safeguards are in
            place for such transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by posting the new policy on our
            platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data
            practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p>
              <strong>Email:</strong> privacy@digitalbillboardmarketplace.co.za
            </p>
            <p>
              <strong>Address:</strong> [Your Business Address]
            </p>
            <p>
              <strong>Phone:</strong> [Your Contact Number]
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
