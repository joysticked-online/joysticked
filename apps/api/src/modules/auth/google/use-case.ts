import {
  createOAuthState,
  generateCodeVerifier,
  getGoogleOAuthClient
} from '../../../shared/providers/oauth';

export async function googleOAuthUseCase() {
  const google = getGoogleOAuthClient();
  const codeVerifier = generateCodeVerifier();
  const state = await createOAuthState({ provider: 'google', codeVerifier });
  const authorizationUrl = google.createAuthorizationURL(state, codeVerifier, [
    'openid',
    'profile',
    'email'
  ]);

  return { url: authorizationUrl.toString() };
}
