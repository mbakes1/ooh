/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Digital Billboard Marketplace",
  description:
    "Terms of service for the Digital Billboard Marketplace platform",
};

export default function TermsOfServicePage() {
  return (
    // eslint-disable-next-line react/no-unescaped-entities
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString("en-ZA")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the Digital Billboard Marketplace platform
            ("Service"), you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the
            above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Description of Service
          </h2>
          <p>
            Digital Billboard Marketplace is a platform that connects digital
            Out-of-Home (OOH) billboard owners with advertisers in South Africa.
            The Service allows billboard owners to list their available digital
            advertising spaces and enables advertisers to discover and inquire
            about advertising opportunities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

          <h3 className="text-xl font-medium mb-3">3.1 Account Registration</h3>
          <p>
            To use certain features of the Service, you must register for an
            account. You agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.2 Account Types</h3>
          <p>We offer two types of accounts:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Billboard Owner:</strong> For listing and managing digital
              billboard spaces
            </li>
            <li>
              <strong>Advertiser:</strong> For searching and inquiring about
              advertising opportunities
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. User Responsibilities
          </h2>

          <h3 className="text-xl font-medium mb-3">4.1 Billboard Owners</h3>
          <p>As a billboard owner, you agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Provide accurate information about your billboard properties
            </li>
            <li>Maintain current availability and pricing information</li>
            <li>Respond to inquiries in a timely and professional manner</li>
            <li>Honor agreements made through the platform</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4.2 Advertisers</h3>
          <p>As an advertiser, you agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use the platform only for legitimate advertising purposes</li>
            <li>Respect billboard owners' terms and conditions</li>
            <li>Provide accurate information in all communications</li>
            <li>Comply with advertising standards and regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
          <p>You may not use the Service to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Post false, misleading, or fraudulent information</li>
            <li>Engage in any form of harassment or abuse</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Distribute spam or unsolicited communications</li>
            <li>Attempt to gain unauthorized access to the platform</li>
            <li>Use automated systems to access the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Content and Intellectual Property
          </h2>

          <h3 className="text-xl font-medium mb-3">6.1 User Content</h3>
          <p>
            You retain ownership of content you submit to the platform. By
            submitting content, you grant us a non-exclusive, worldwide,
            royalty-free license to use, display, and distribute your content in
            connection with the Service.
          </p>

          <h3 className="text-xl font-medium mb-3">6.2 Platform Content</h3>
          <p>
            The Service and its original content, features, and functionality
            are owned by Digital Billboard Marketplace and are protected by
            international copyright, trademark, and other intellectual property
            laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Privacy and Data Protection
          </h2>
          <p>
            Your privacy is important to us. Our Privacy Policy explains how we
            collect, use, and protect your information when you use the Service.
            By using the Service, you agree to the collection and use of
            information in accordance with our Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Payment and Fees</h2>
          <p>
            The platform facilitates connections between billboard owners and
            advertisers. Any payment arrangements are made directly between
            users. We may introduce platform fees in the future, with
            appropriate notice to users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            9. Disclaimers and Limitations
          </h2>

          <h3 className="text-xl font-medium mb-3">9.1 Service Availability</h3>
          <p>
            We strive to maintain the Service but cannot guarantee uninterrupted
            access. The Service is provided "as is" without warranties of any
            kind.
          </p>

          <h3 className="text-xl font-medium mb-3">9.2 User Interactions</h3>
          <p>
            We are not responsible for the conduct of users or the outcome of
            transactions between users. Users interact at their own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Digital Billboard
            Marketplace from any claims, damages, or expenses arising from your
            use of the Service or violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibent mb-4">11. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service
            immediately, without prior notice, for conduct that we believe
            violates these Terms or is harmful to other users or the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of South Africa, without regard to its conflict of law
            provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify users of any material changes by posting the new Terms on the
            platform. Your continued use of the Service after such modifications
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            14. Contact Information
          </h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p>
              <strong>Email:</strong> legal@digitalbillboardmarketplace.co.za
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
