import { startOAuthLoginUseCase } from '../application/oauth-use-cases';

export async function discordOAuthUseCase() {
  return startOAuthLoginUseCase('discord');
}
