import {
  createOAuthState,
  generateCodeVerifier,
  getDiscordOAuthClient
} from '../../../shared/providers/oauth';

export async function discordOAuthUseCase() {
  const discord = getDiscordOAuthClient();
  const codeVerifier = generateCodeVerifier();
  const state = await createOAuthState({ provider: 'discord', codeVerifier });
  const authorizationUrl = discord.createAuthorizationURL(state, codeVerifier, [
    'identify',
    'email'
  ]);

  return { state, url: authorizationUrl.toString() };
}
