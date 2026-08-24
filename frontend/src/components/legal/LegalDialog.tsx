import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type LegalType = "privacy" | "terms";

const LEGAL_CONTENT: Record<
  LegalType,
  { title: string; sections: { heading: string; body: string }[] }
> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Information We Collect",
        body: "When you use GlobeTrotter, we collect information you provide directly — such as your name, email address, travel preferences, and trip details. We also collect usage data including pages visited, features used, and interactions within the app to improve your experience.",
      },
      {
        heading: "How We Use Your Information",
        body: "Your information is used to personalise your travel planning experience, provide tailored destination recommendations, manage your itineraries and budgets, and communicate important updates about your trips. We may also use aggregated, anonymised data to improve our services.",
      },
      {
        heading: "Data Sharing",
        body: "We do not sell your personal information to third parties. We may share limited data with trusted service providers who help us operate the platform — such as cloud hosting and analytics — under strict confidentiality agreements. Your trip data is private unless you choose to share it.",
      },
      {
        heading: "Data Security",
        body: "We implement industry-standard encryption, secure authentication, and regular security audits to protect your data. All trip and personal information is encrypted at rest and in transit. However, no method of transmission over the internet is 100% secure.",
      },
      {
        heading: "Your Rights",
        body: "You have the right to access, update, or delete your personal data at any time through your account settings. You can also request a full export of your data or ask us to permanently remove it by contacting our support team.",
      },
      {
        heading: "Cookies & Tracking",
        body: "GlobeTrotter uses essential cookies for authentication and session management. We may use analytics cookies to understand how you use the app so we can improve it. You can manage cookie preferences through your browser settings.",
      },
      {
        heading: "Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. Significant changes will be communicated via email or an in-app notification. Continued use of GlobeTrotter after changes constitutes acceptance of the updated policy.",
      },
      {
        heading: "Contact Us",
        body: "If you have any questions about this Privacy Policy or how we handle your data, please reach out to us at privacy@globetrotter.app or through the Help & Support page.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By accessing or using GlobeTrotter, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the platform.",
      },
      {
        heading: "Use of the Platform",
        body: "GlobeTrotter is a travel planning tool designed to help you organise trips, itineraries, and budgets. You may use the platform for personal, non-commercial purposes. Automated or bulk access to the platform is strictly prohibited.",
      },
      {
        heading: "User Accounts",
        body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate information during registration and keep it up to date.",
      },
      {
        heading: "User-Generated Content",
        body: "Any trip plans, reviews, or content you create on GlobeTrotter remains yours. By sharing content publicly, you grant us a non-exclusive licence to display and promote it within the platform. You can make content private or delete it at any time.",
      },
      {
        heading: "Intellectual Property",
        body: "All content, design, logos, and code on GlobeTrotter are owned by us or our licensors. You may not copy, modify, distribute, or reverse-engineer any part of the platform without written permission.",
      },
      {
        heading: "Third-Party Services",
        body: "GlobeTrotter may link to or integrate with third-party services (such as maps, images, or travel providers). We are not responsible for the availability, accuracy, or policies of external services. Use them at your own discretion.",
      },
      {
        heading: "Limitation of Liability",
        body: "GlobeTrotter is provided 'as is' for planning purposes. We are not liable for any travel decisions, financial losses, or damages resulting from the use of our platform. Always verify details with official sources before travelling.",
      },
      {
        heading: "Termination",
        body: "We reserve the right to suspend or terminate your account if you violate these terms or engage in harmful behaviour. You may also delete your account at any time from your settings.",
      },
      {
        heading: "Changes to Terms",
        body: "We may revise these terms at any time. Material changes will be notified through the app or via email. Your continued use of GlobeTrotter after changes take effect signifies acceptance of the updated terms.",
      },
      {
        heading: "Contact",
        body: "For questions about these Terms & Conditions, contact us at legal@globetrotter.app or visit our Help & Support page.",
      },
    ],
  },
};

export function LegalDialog({
  type,
  trigger,
}: {
  type: LegalType;
  trigger: React.ReactNode;
}) {
  const content = LEGAL_CONTENT[type];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="font-heading text-xl font-bold">
            {content.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="space-y-6 px-6 py-5">
            {content.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="text-sm font-semibold text-foreground">
                  {section.heading}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
