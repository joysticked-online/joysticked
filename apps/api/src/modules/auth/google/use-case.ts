import { startOAuthLoginUseCase } from '../application/oauth-use-cases';

export async function googleOAuthUseCase() {
  return startOAuthLoginUseCase('google');
}
