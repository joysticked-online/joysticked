import { Container, Preview, Text } from '@react-email/components';
import BaseLayout, { EmailHeader, textStyles, WaitlistEmailFooter } from './base-layout';

export default function WelcomeToTheWaitlistTemplate() {
  return (
    <BaseLayout preview={<Preview>Welcome to the Joysticked Waitlist</Preview>}>
      <EmailHeader>
        Thank you for <br />
        joining our waitlist!
      </EmailHeader>

      <Container className="mb-8">
        <Text className={textStyles.semibold}>
          Thank you for your interest in JoySticked and for joining our waitlist! We are thrilled to
          have you.
        </Text>

        <Text className={textStyles.light}>
          You are now officially one of the first to know when we are ready to launch.{' '}
          <span className="font-semibold">
            We're excited and can't wait to share joysticked with you
          </span>
          . Make sure to watch your inbox to keep up with our updates.
        </Text>
      </Container>

      <WaitlistEmailFooter />
    </BaseLayout>
  );
}
