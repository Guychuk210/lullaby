import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

/**
 * Component to render a policy section with a title and content
 */
interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

const PolicySection = ({ title, children }: PolicySectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

/**
 * Component to render a paragraph of text in a policy
 */
interface PolicyParagraphProps {
  children: React.ReactNode;
  isBold?: boolean;
}

const PolicyParagraph = ({ children, isBold = false }: PolicyParagraphProps) => (
  <Text style={[styles.paragraph, isBold && styles.boldText]}>
    {children}
  </Text>
);

/**
 * Component to render a bullet point in a policy
 */
interface PolicyBulletPointProps {
  text: string;
}

const PolicyBulletPoint = ({ text }: PolicyBulletPointProps) => (
  <View style={styles.bulletPointContainer}>
    <Text style={styles.bulletPoint}>•</Text>
    <Text style={styles.bulletPointText}>{text}</Text>
  </View>
);

/**
 * Privacy Policy component with actual formatted content
 */
export const PrivacyPolicy = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last Updated: May 2025</Text>
      
      <PolicySection title="1. Your Acceptance of This Policy">
        <PolicyParagraph>
          By using our Services, you acknowledge that you have read and understand this Privacy Policy and our Terms of Use, and expressly consent to our collection, use, and sharing of your information as described herein.
        </PolicyParagraph>
        <PolicyParagraph>
          If you do not agree with these terms, please do not use our Platform. Your continued use of our Services following the posting of changes to this Privacy Policy will constitute your acceptance of such changes.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="2. What Information We Collect">
        <PolicyParagraph>
          We collect personal data to operate and improve our Services:
        </PolicyParagraph>

        <PolicyParagraph isBold>Information You Provide</PolicyParagraph>
        <PolicyParagraph>
          Includes account creation details (e.g. name, email), subscription and payment information, survey responses, messages sent through the app, and feedback on treatment progress.
        </PolicyParagraph>
        
        <PolicyParagraph isBold>Sensor Data</PolicyParagraph>
        <PolicyParagraph>
          We collect and store real-time bedwetting event data transmitted by the Numah.AI sensor, including timestamps and usage logs.
        </PolicyParagraph>
        
        <PolicyParagraph isBold>Automatic Data</PolicyParagraph>
        <PolicyParagraph>
          Includes device identifiers, app activity logs, IP address, and cookie data for analytics and performance tracking.
        </PolicyParagraph>
        
        <PolicyParagraph isBold>Chatbot Interactions</PolicyParagraph>
        <PolicyParagraph>
          Conversations with our AI-powered chatbot may be stored and used to improve service quality and personalize your experience.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="3. How We Use Your Information">
        <PolicyParagraph>
          We use your data to:
        </PolicyParagraph>
        <PolicyBulletPoint text="Provide and manage your access to our app and sensor" />
        <PolicyBulletPoint text="Process subscriptions and payments" />
        <PolicyBulletPoint text="Track your treatment progress and offer personalized recommendations" />
        <PolicyBulletPoint text="Send service-related updates and support messages" />
        <PolicyBulletPoint text="Improve product performance and user experience" />
        <PolicyBulletPoint text="Comply with legal obligations" />
        <PolicyBulletPoint text="Offer promotional content (only with your consent)" />
      </PolicySection>
      
      <PolicySection title="Intellectual Property Rights">
        <PolicyParagraph>
          By providing feedback, suggestions, or ideas about our Services, you grant us a non-exclusive, worldwide, royalty-free, irrevocable, sub-licensable, perpetual license to use and publish those ideas and materials for any purpose, without compensation to you.
        </PolicyParagraph>
        <PolicyParagraph>
          We may use anonymized, de-identified, or aggregated data for any lawful business purpose, including but not limited to research, analytics, product development, statistical analysis, and marketing, without restriction and without obligation to provide notice or compensation to you.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="4. Sharing Your Data">
        <PolicyParagraph>
          We do not sell your personal data. We may share it only as follows:
        </PolicyParagraph>
        
        <PolicyParagraph isBold>Service Providers</PolicyParagraph>
        <PolicyParagraph>
          With third parties who help operate our platform (e.g. hosting, payment processing, email delivery), under strict data protection agreements.
        </PolicyParagraph>
        
        <PolicyParagraph isBold>Legal Compliance</PolicyParagraph>
        <PolicyParagraph>
          If required by law or to enforce our Terms, prevent fraud, or protect rights.
        </PolicyParagraph>
        
        <PolicyParagraph isBold>Business Transfers</PolicyParagraph>
        <PolicyParagraph>
          In connection with any merger, acquisition, reorganization, bankruptcy, sale of all or a portion of our assets, or other similar transaction, your data may be transferred as a business asset. By using our Services, you acknowledge and consent to such transfers.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="5. Data Retention">
        <PolicyParagraph>
          We retain your data as long as necessary to fulfill the purposes outlined above or as required by law. You may request deletion of your data by emailing: support@numah.ai.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="6. Security">
        <PolicyParagraph>
          We implement reasonable technical and organizational measures designed to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data, and you acknowledge that you provide your information at your own risk.
        </PolicyParagraph>
        <PolicyParagraph>
          You are responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="7. Cookies and Tracking">
        <PolicyParagraph>
          We use cookies and similar technologies for:
        </PolicyParagraph>
        <PolicyBulletPoint text="Authentication and session management" />
        <PolicyBulletPoint text="Analytics and performance measurement" />
        <PolicyBulletPoint text="Preventing fraud" />
        <PolicyParagraph>
          You can adjust cookie settings via your browser. Note that disabling cookies may limit some app functions.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="8. Your Rights">
        <PolicyParagraph>
          You may:
        </PolicyParagraph>
        <PolicyBulletPoint text="Access your personal information" />
        <PolicyBulletPoint text="Request corrections or deletion" />
        <PolicyBulletPoint text="Withdraw consent at any time" />
        <PolicyBulletPoint text="Object to certain types of processing" />
        <PolicyParagraph>
          To exercise any of these rights, email support@numah.ai. We may request specific information to verify your identity before processing your request.
        </PolicyParagraph>
        <PolicyParagraph>
          We may deny certain requests, or fulfill a request only in part, if we have a lawful basis for doing so. We reserve the right to charge a reasonable fee or refuse to act on requests that are manifestly unfounded or excessive, particularly if they are repetitive.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="9. Children's Privacy">
        <PolicyParagraph>
          Our Services are intended for use by parents or guardians. We do not knowingly collect personal data from children under 18 without verified parental consent. If you believe a child has used the Services without permission, contact us and we will delete the data.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="10. Third-Party Links">
        <PolicyParagraph>
          Our app or site may contain links to external websites. We are not responsible for the privacy practices of other websites.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="11. Changes to This Policy">
        <PolicyParagraph>
          We may update this Privacy Policy from time to time. We will post any changes on this page and update the revision date. Continued use of the Services after changes are made indicates your acceptance of the new policy.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="12. Limitation of Liability">
        <PolicyParagraph isBold>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NUMAH.AI AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, PARTNERS AND LICENSORS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, REVENUE, DATA, USE, GOODWILL, BUSINESS INTERRUPTION, COST OF SUBSTITUTE GOODS OR SERVICES, OR ANY OTHER INTANGIBLE OR TANGIBLE LOSSES (EVEN IF NUMAH.AI HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM:
        </PolicyParagraph>
        <PolicyBulletPoint text="YOUR ACCESS TO, USE OF, OR INABILITY TO ACCESS OR USE THE SERVICES;" />
        <PolicyBulletPoint text="ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON OR RELATED TO THE SERVICES;" />
        <PolicyBulletPoint text="ANY CONTENT, INFORMATION, OR MATERIALS OBTAINED FROM THE SERVICES;" />
        <PolicyBulletPoint text="UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT;" />
        <PolicyBulletPoint text="BUGS, VIRUSES, TROJANS, OR THE LIKE THAT MAY BE TRANSMITTED TO OR THROUGH OUR SERVICES;" />
        <PolicyBulletPoint text="ERRORS OR INACCURACIES IN ANY CONTENT, INFORMATION, RECOMMENDATIONS OR ADVICE PROVIDED BY THE SERVICES;" />
        <PolicyBulletPoint text="ANY OTHER MATTER RELATING TO THE SERVICES." />
        
        <PolicyParagraph isBold>
          YOU SPECIFICALLY ACKNOWLEDGE THAT NUMAH.AI SHALL NOT BE LIABLE FOR USER CONTENT OR THE DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF ANY THIRD PARTY AND THAT THE RISK OF HARM OR DAMAGE FROM THE FOREGOING RESTS ENTIRELY WITH YOU.
        </PolicyParagraph>
        
        <PolicyParagraph isBold>
          IN NO EVENT SHALL NUMAH.AI'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING OR USING OUR SERVICES DURING THE TWELVE (12) MONTHS PRIOR TO BRINGING THE CLAIM, OR ONE DOLLARS ($1), WHICHEVER IS LESS.
        </PolicyParagraph>
        
        <PolicyParagraph isBold>
          THE LIMITATIONS OF DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN NUMAH.AI AND YOU. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CERTAIN TYPES OF DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU IN SUCH CASES, NUMAH.AI'S LIABILITY WILL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="Contact Us">
        <PolicyParagraph>
          If you have questions or concerns about your privacy, contact us at:
        </PolicyParagraph>
        <PolicyParagraph>
          📧 support@numah.ai
        </PolicyParagraph>
      </PolicySection>
    </ScrollView>
  );
};

/**
 * Terms of Service component with actual formatted content
 */
export const TermsOfService = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.lastUpdated}>Last Updated: May 2025</Text>
      
      <PolicyParagraph>
        Welcome to Numah.AI (the "Company", "we," "us," or "our"), a personalized digital
        platform designed to support families coping with bedwetting. By using our mobile
        application, website, and hardware sensor (together, the "Platform" or "Services"), you
        agree to these Terms of Use (the "Terms").
      </PolicyParagraph>
      
      <PolicyParagraph>
        The Platform is operated by the Numah.AI team, which under incorporation. These Terms
        are binding on all users, and your continued use of the Platform constitutes acceptance of
        the Terms.
      </PolicyParagraph>
      
      <PolicyParagraph isBold>
        If you do not agree to these Terms, please do not use the Platform.
      </PolicyParagraph>
      
      <PolicySection title="1. Eligibility and User Agreement">
        <PolicyBulletPoint text="You must be 18 years or older, or use the Platform under the supervision and with the consent of a parent or legal guardian." />
        <PolicyBulletPoint text="By using the Platform, you agree to these Terms and our Privacy Policy." />
        <PolicyBulletPoint text="We reserve the right to update, modify, or replace these Terms at any time at our sole discretion. It is your responsibility to check these Terms periodically for changes. Your continued use of the Platform following the posting of any changes constitutes acceptance of those changes. If you do not agree to the new Terms, you must stop using the Platform." />
      </PolicySection>
      
      <PolicySection title="2. No Medical Advice or Guarantees">
        <PolicyBulletPoint text="Numah.AI is not a medical service. Our tools, including the AI chatbot and the treatment suggestions offered in the app, are based on publicly available best practices and general behavioral methods." />
        <PolicyBulletPoint text="We do not guarantee that our product or service will be effective for every child or adult. Success varies from person to person and depends on many external factors beyond our control." />
        <PolicyBulletPoint text="We take no responsibility for any physical harm related to the use of the product. This includes, but is not limited to, incidents such as electric shock, slipping on the product, or a parent injuring themselves after being woken by the device in the middle of the night." />
        <PolicyBulletPoint text="If you or your child experience psychological distress, medical concerns, or regression in behavior, we encourage you to consult a licensed healthcare professional." />
        
        <PolicyParagraph isBold>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM IS
          PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
          WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION
          ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, TITLE, OR NON-INFRINGEMENT. NUMAH.AI DOES NOT WARRANT THAT
          THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL
          COMPONENTS, OR THAT ANY CONTENT IS ACCURATE OR COMPLETE.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="3. Disclaimer Regarding Chatbot and Emotional Reactions">
        <PolicyBulletPoint text="The AI chatbot is not human and may at times respond in ways that feel impersonal, unclear, or emotionally inadequate." />
        <PolicyBulletPoint text="If a user is offended, hurt, or upset by responses from the chatbot or the app, we do not take responsibility for emotional distress, and the use of the app should be discontinued in such cases." />
      </PolicySection>
      
      <PolicySection title="4. Permitted Use">
        <PolicyParagraph>
          We grant you a limited, non-transferable license to use the Platform for personal and
          non-commercial purposes only. You agree not to:
        </PolicyParagraph>
        <PolicyBulletPoint text="Reverse engineer or extract code or data" />
        <PolicyBulletPoint text="Copy, reproduce, or resell any part of the Platform" />
        <PolicyBulletPoint text="Send over Links to the Guidance videos to a non customer that paid for this service." />
        <PolicyBulletPoint text="Circumvent security features" />
        <PolicyBulletPoint text="Spam or overload the system" />
        <PolicyBulletPoint text="Use the Platform for any illegal purpose" />
        
        <PolicyParagraph>
          Violation of these rules may result in suspension or permanent removal from the Platform.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="5. Payments and Subscriptions">
        <PolicyBulletPoint text="Some features of the Platform may be available via a monthly subscription." />
        <PolicyBulletPoint text="You agree to provide accurate billing information and understand that fees are non-refundable, unless explicitly stated otherwise." />
        <PolicyBulletPoint text="In the future, we may offer a money-back guarantee for physical products, which will be outlined at the time of purchase." />
      </PolicySection>
      
      <PolicySection title="6. User Content and Data">
        <PolicyBulletPoint text="You are responsible for any content you provide through the Platform, including feedback and chat inputs." />
        <PolicyBulletPoint text="By using the Platform, you grant us a worldwide, perpetual, irrevocable, royalty-free, fully-paid, non-exclusive, transferable, and sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display anonymized and aggregated data for research, product improvement, marketing, and other business purposes. Any feedback, comments, or suggestions you provide regarding the Platform may be used by us without restriction or compensation to you." />
      </PolicySection>
      
      <PolicySection title="7. Intellectual Property">
        <PolicyBulletPoint text="All content on the Platform, including but not limited to software, algorithms, designs, videos, graphics, branding, text, data, user interface, visual interface, and all other intellectual property contained therein, are owned or licensed by Numah.AI and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. Nothing in these Terms grants you any right, title, or interest in any intellectual property owned or licensed by Numah.AI." />
        <PolicyBulletPoint text="You may not use our branding, system designs, or content without written permission." />
      </PolicySection>
      
      <PolicySection title="8. Third-Party Services">
        <PolicyBulletPoint text="We may use third-party services (e.g., payment processors, AI providers, Firebase) to deliver features. We are not responsible for their terms, policies, or actions." />
      </PolicySection>
      
      <PolicySection title="9. Limitations of Liability">
        <PolicyParagraph>
          We are not liable for:
        </PolicyParagraph>
        <PolicyBulletPoint text="Treatment outcomes or lack of improvement" />
        <PolicyBulletPoint text="Emotional reactions to chatbot responses or notifications" />
        <PolicyBulletPoint text="Technical issues or data loss" />
        <PolicyBulletPoint text="Interruptions in service availability" />
        
        <PolicyParagraph>
          To the fullest extent allowed by law, any liability is limited to the amount you paid, if
          any, for using the Platform.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="10. Termination">
        <PolicyParagraph>
          We may suspend or terminate access to the Platform at our discretion, especially if there is a
          breach of these Terms.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="11. Governing Law">
        <PolicyParagraph>
          These Terms shall be governed by the laws of the State of Israel. Any disputes shall be
          subject to the exclusive jurisdiction of the courts in Tel Aviv, Israel.
        </PolicyParagraph>
      </PolicySection>
      
      <PolicySection title="12. Contact">
        <PolicyParagraph>
          We are a growing startup and currently operate without a formal legal entity. For questions,
          concerns, or requests, contact us at:
        </PolicyParagraph>
        <PolicyParagraph>
          📧 support@numah.ai
        </PolicyParagraph>
      </PolicySection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.m,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  lastUpdated: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[500],
    marginBottom: theme.spacing.l,
  },
  section: {
    marginBottom: theme.spacing.l,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.s,
  },
  paragraph: {
    fontSize: theme.typography.fontSize.m,
    lineHeight: 24,
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  boldText: {
    fontWeight: 'bold',
  },
  bulletPointContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.s,
    paddingLeft: theme.spacing.s,
  },
  bulletPoint: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
    marginRight: theme.spacing.s,
  },
  bulletPointText: {
    flex: 1,
    fontSize: theme.typography.fontSize.m,
    lineHeight: 22,
    color: colors.text,
  },
}); 