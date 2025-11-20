import { Container, Preview, Text } from '@react-email/components';
import { envs } from '../../../../shared/config/envs';
import BaseLayout, { EmailHeader, textStyles, WaitlistEmailFooter } from './base-layout';

export default function WelcomeToTheWaitlistTemplate({ email }: { email: string }) {
  return (
    <BaseLayout preview={<Preview>Welcome to the Joysticked Waitlist</Preview>}>
      <EmailHeader url={'https://i.imgur.com/FbSuAw9.png'} alt={'Joysticked Clouds'} />

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

      <WaitlistEmailFooter clientUrl={envs.app.CLIENT_URL} email={email} />
    </BaseLayout>
  );
}
