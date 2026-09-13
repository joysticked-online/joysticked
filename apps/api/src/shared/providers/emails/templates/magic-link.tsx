import { Button, Container, Preview, Section, Text } from '@react-email/components';
import BaseLayout, { EmailHeader, textStyles } from './base-layout';

interface MagicLinkTemplateProps {
  link: string;
}

export default function MagicLinkTemplate({
  link = 'http://localhost:8080/auth/verify?token=preview_token_123'
}: Partial<MagicLinkTemplateProps>) {
  return (
    <BaseLayout preview={<Preview>Your Joysticked sign-in link is ready</Preview>}>
      <EmailHeader url={'https://i.imgur.com/FbSuAw9.png'} alt={'Joysticked'} />

      <Container className="mb-8">
        <Text className={textStyles.semibold}>Ready to log in to Joysticked?</Text>

        <Text className={textStyles.light}>
          Click the button below to authenticate your account and get right back into the action.
          This link will expire in <span className="font-semibold">15 minutes</span> and can only be
          used once.
        </Text>

        <Section className="my-6 text-center">
          <Button
            href={link}
            className="rounded-xl bg-[#fafafa] px-6 py-3 text-center font-semibold text-[#171717] text-xs no-underline"
          >
            Sign in to Joysticked
          </Button>
        </Section>

        <Text className={textStyles.light}>
          If you didn't request this sign-in link, you can safely ignore this email.
        </Text>
      </Container>
    </BaseLayout>
  );
}
