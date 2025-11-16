import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { emailService } from '../providers/emails';
import { db } from '../database';
import { envs } from './envs';

const OTP_EXPIRATION_MINUTES = 5;

export const auth = betterAuth({
  baseURL: envs.auth.BETTER_AUTH_URL,
  trustedOrigins: [envs.app.CLIENT_URL],
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: false
  },
  socialProviders: {
    google: {
      clientId: envs.auth.GOOGLE_CLIENT_ID,
      clientSecret: envs.auth.GOOGLE_CLIENT_SECRET
    },
    discord: {
      clientId: envs.auth.DISCORD_CLIENT_ID,
      clientSecret: envs.auth.DISCORD_CLIENT_SECRET
    }
  },
  secret: envs.auth.BETTER_AUTH_SECRET,
  plugins: [
    emailOTP({
      expiresIn: OTP_EXPIRATION_MINUTES * 60,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await emailService.sendEmail({
          to: email,
          template: 'auth-email-otp',
          payload: {
            otp,
            type,
            expiresInMinutes: OTP_EXPIRATION_MINUTES
          },
          idempotencyKey: `auth-email-otp:${type}:${email}:${otp}`
        });
      }
    })
  ]
});