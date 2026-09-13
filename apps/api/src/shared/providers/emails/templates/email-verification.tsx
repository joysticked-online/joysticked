import { Container, Preview, Text } from '@react-email/components';

import BaseLayout, { EmailHeader, textStyles } from './base-layout';

export default function EmailVerificationTemplate({ otp }: { otp: string }) {
  return (
    <BaseLayout preview={<Preview>Your Joysticked verification code</Preview>}>
      <EmailHeader url="https://i.imgur.com/FbSuAw9.png" alt="Joysticked" />
      <Container className="mb-8">
        <Text className={textStyles.semibold}>Verify your Joysticked email</Text>
        <Text className={textStyles.light}>
          Enter this code to continue. It expires in 10 minutes and can only be used once.
        </Text>
        <Text className="text-center font-semibold text-2xl tracking-[0.4em]">{otp}</Text>
        <Text className={textStyles.light}>
          If you did not request this code, ignore this email.
        </Text>
      </Container>
    </BaseLayout>
  );
}
