import type { Database } from '../../../shared/database';
import { createUserRepository } from '../../../shared/database/repositories/user-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import { consumeMagicLinkToken } from '../../../shared/providers/magic-link';
import { createSession } from '../../../shared/providers/session';

export async function verifyMagicLinkUseCase(db: Database, { token }: { token: string }) {
  const email = await consumeMagicLinkToken(token);
  if (!email) {
    return null;
  }

  const userRepository = createUserRepository(db);

  return executeTransaction(db, async (tx) => {
    let user = await userRepository.findByEmail(email);

    if (!user) {
      user = await userRepository.createWithEmail(email, tx);
    }

    if (!user.emailVerified) {
      await userRepository.setEmailVerified(user.id, tx);
    }

    const sessionToken = await createSession(user.id);

    return {
      userId: user.id,
      sessionToken,
      hasUsername: Boolean(user.username && !user.username.startsWith('user_'))
    };
  });
}
