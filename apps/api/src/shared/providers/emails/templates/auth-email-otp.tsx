import { Container, Preview, Text } from '@react-email/components';

import BaseLayout, { EmailHeader, textStyles } from './base-layout';

type AuthEmailOTPTemplateProps = {
  otp: string;
  type: 'sign-in' | 'email-verification';
  expiresInMinutes: number;
};

const COPY: Record<
  AuthEmailOTPTemplateProps['type'],
  {
    header: string;
    description: string;
    preview: string;
  }
> = {
  'sign-in': {
    header: 'Use this code to sign in',
    description:
      "Enter the code below to securely access your Joysticked account. If you didn't request this, you can safely ignore this message.",
    preview: 'Your Joysticked sign-in code'
  },
  'email-verification': {
    header: 'Confirm your email address',
    description:
      'Enter this code to verify your email and finish setting up your Joysticked account.',
    preview: 'Verify your Joysticked email'
  },
};

export default function AuthEmailOTPTemplate({
  otp,
  type,
  expiresInMinutes
}: AuthEmailOTPTemplateProps) {
  const copy = COPY[type];
  const formattedOTP = otp.split('').join(' ');

  return (
    <BaseLayout preview={<Preview>{copy.preview}</Preview>}>
      <EmailHeader>{copy.header}</EmailHeader>

      <Container className="mb-8">
        <Text className={textStyles.semibold}>{copy.description}</Text>

        <Text className="mt-6 text-xl font-semibold tracking-[0.5rem]">{formattedOTP}</Text>

        <Text className={`${textStyles.light} mt-4`}>
          This code expires in {expiresInMinutes} minute{expiresInMinutes === 1 ? '' : 's'}.
        </Text>
      </Container>

      <Container className="mt-12">
        <Text className={textStyles.light}>Need help? Reply to this email and we will assist you.</Text>
      </Container>
    </BaseLayout>
  );
}

