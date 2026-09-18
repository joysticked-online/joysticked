import type { Database } from '../../../shared/database';
import { completeOAuthLoginUseCase } from '../application/oauth-use-cases';

export async function googleOAuthCallbackUseCase(
  db: Database,
  { code, state }: { code: string; state: string }
) {
  return completeOAuthLoginUseCase(db, { provider: 'google', code, state });
}
