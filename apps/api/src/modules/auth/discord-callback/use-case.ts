import type { Database } from '../../../shared/database';
import { completeOAuthLoginUseCase } from '../application/oauth-use-cases';

export async function discordOAuthCallbackUseCase(
  db: Database,
  { code, state }: { code: string; state: string }
) {
  return completeOAuthLoginUseCase(db, { provider: 'discord', code, state });
}
