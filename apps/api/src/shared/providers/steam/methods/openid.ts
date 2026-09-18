import { STEAM_OPENID_URL } from './core';
import { SteamSearchMethods } from './search';

export class SteamOpenIdMethods extends SteamSearchMethods {
  /**
   * Generates the OpenID 2.0 URL to redirect the user to Steam Login.
   */
  createOpenIdUrl(returnUrl: string, realm: string): string {
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnUrl,
      'openid.realm': realm,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    return `${STEAM_OPENID_URL}?${params.toString()}`;
  }

  /**
   * Validates the OpenID 2.0 callback assertion returned from Steam.
   * Extracts and returns the verified 64-bit SteamID if valid.
   */
  async verifyOpenIdCallback(
    queryParams: Record<string, string>,
    expectedReturnUrl: string
  ): Promise<string | null> {
    const returnTo = queryParams['openid.return_to'];
    const responseNonce = queryParams['openid.response_nonce'];
    if (!returnTo || !responseNonce) return null;

    try {
      const expected = new URL(expectedReturnUrl);
      const actual = new URL(returnTo);
      if (actual.origin !== expected.origin || actual.pathname !== expected.pathname) return null;
      if (actual.searchParams.get('state') !== queryParams.state) return null;
    } catch {
      return null;
    }

    const nonceTimestamp = Date.parse(responseNonce.slice(0, 20));
    const nonceAge = Date.now() - nonceTimestamp;
    if (!Number.isFinite(nonceTimestamp) || nonceAge < -60_000 || nonceAge > 10 * 60_000) {
      return null;
    }

    const claimedId = queryParams['openid.claimed_id'];
    if (!claimedId) return null;

    const steamIdMatch = claimedId.match(/\/id\/(\d+)$/);
    if (!steamIdMatch?.[1]) return null;
    const steamId = steamIdMatch[1];

    // Verify assertion with Steam OpenID server
    const verificationParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      verificationParams.append(key, value);
    }
    verificationParams.set('openid.mode', 'check_authentication');

    try {
      const response = await fetch(STEAM_OPENID_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verificationParams.toString()
      });

      const text = await response.text();
      if (text.includes('is_valid:true')) {
        return steamId;
      }
    } catch (err) {
      console.error('[SteamService] Failed to verify OpenID callback:', err);
    }

    return null;
  }
}
