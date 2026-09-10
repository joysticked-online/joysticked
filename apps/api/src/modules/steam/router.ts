import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import z from 'zod';

import { envs } from '../../shared/config/envs';
import { createOAuthAccountRepository } from '../../shared/database/repositories/oauth-account-repository';
import { createUserRepository } from '../../shared/database/repositories/user-repository';
import { users } from '../../shared/database/schemas/users';
import { executeTransaction } from '../../shared/database/transaction';
import { authMiddleware } from '../../shared/http/middlewares/auth';
import { databaseMiddleware } from '../../shared/http/middlewares/database';
import { consumeOAuthState, createOAuthState } from '../../shared/providers/oauth';
import { createSession } from '../../shared/providers/session';
import { steamService } from '../../shared/providers/steam/steam-service';

const STEAM_STATE_TTL_SECONDS = 60 * 10;
const STEAM_ID_PATTERN = /^7656119\d{10}$/;

function getSafeReturnPath(value: string | undefined): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/profile';

  try {
    const parsed = new URL(value, envs.app.CLIENT_URL);
    if (parsed.origin !== new URL(envs.app.CLIENT_URL).origin) return '/profile';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/profile';
  }
}

export const steamRouter = new Elysia({ prefix: '/steam' })
  .use(databaseMiddleware)
  .use(authMiddleware)

  /**
   * Manual Steam linking is intentionally disabled because a SteamID or profile URL
   * does not prove account ownership. Use the Steam OpenID flow instead.
   */
  .post(
    '/link',
    ({ userId, status }) => {
      if (!userId) {
        return status(401, { message: 'Unauthorized' });
      }

      return status(400, {
        message: 'Para vincular sua conta Steam, use a autenticação oficial da Steam (OpenID).'
      });
    },
    {
      body: z.object({
        steamUrlOrId: z.string().min(1),
        isPublic: z.boolean().optional().default(true)
      })
    }
  )

  /**
   * Unlink Steam account
   */
  .post('/unlink', async ({ db, userId, status }) => {
    if (!userId) {
      return status(401, { message: 'Unauthorized' });
    }

    const userRepo = createUserRepository(db);
    const user = await userRepo.findById(userId);

    if (!user) {
      return status(404, { message: 'Usuário não encontrado' });
    }

    const currentSocials = user.socials || {};
    const updatedSocials = {
      ...currentSocials,
      steam: null,
      steamId: null,
      steamPublic: null
    };

    await db.update(users).set({ socials: updatedSocials }).where(eq(users.id, userId));

    return status(200, { success: true });
  })

  /**
   * Update Steam visibility privacy toggle
   */
  .patch(
    '/privacy',
    async ({ body, db, userId, status }) => {
      if (!userId) {
        return status(401, { message: 'Unauthorized' });
      }

      const userRepo = createUserRepository(db);
      const user = await userRepo.findById(userId);

      if (!user) {
        return status(404, { message: 'Usuário não encontrado' });
      }

      const currentSocials = user.socials || {};
      const updatedSocials = {
        ...currentSocials,
        steamPublic: body.steamPublic
      };

      await db.update(users).set({ socials: updatedSocials }).where(eq(users.id, userId));

      return status(200, { success: true, steamPublic: body.steamPublic });
    },
    {
      body: z.object({
        steamPublic: z.boolean()
      })
    }
  )

  /**
   * Get Steam achievements and user completion status for a game AppID or slug
   */
  .get(
    '/achievements/:identifier',
    async ({ params, db, userId, status }) => {
      let targetSteamId: string | undefined;

      if (userId) {
        const userRepo = createUserRepository(db);
        const user = await userRepo.findById(userId);
        const linkedSteamId = user?.socials?.steamId;
        targetSteamId =
          linkedSteamId && STEAM_ID_PATTERN.test(linkedSteamId) ? linkedSteamId : undefined;
      }

      const KNOWN_SLUGS: Record<string, number> = {
        'elden-ring': 1245620,
        'cyberpunk-2077': 1091500,
        'the-witcher-3-wild-hunt': 292030,
        'hollow-knight': 367520,
        balatro: 2379780,
        'red-dead-redemption-2': 1174180,
        'god-of-war': 1593500,
        'baldurs-gate-3': 1086940,
        'monster-hunter-world': 582010,
        'sekiro-shadows-die-twice': 814380,
        hades: 1145360,
        celeste: 504230
      };

      const raw = params.identifier.trim();
      let resolvedAppId: number | null = /^\d+$/.test(raw)
        ? parseInt(raw, 10)
        : (KNOWN_SLUGS[raw.toLowerCase()] ?? null);

      if (!resolvedAppId) {
        resolvedAppId = await steamService.searchAppId(raw);
      }

      if (!resolvedAppId) {
        return status(404, {
          message: 'Jogo não encontrado na loja da Steam.',
          achievements: [],
          totalCount: 0
        });
      }

      const result = await steamService.getGameAchievementsWithStatus(resolvedAppId, targetSteamId);

      if (!result || result.achievements.length === 0) {
        return status(200, {
          appId: resolvedAppId,
          gameName: result?.gameName || raw,
          achievedCount: 0,
          totalCount: 0,
          progressPercent: 0,
          isConnected: Boolean(targetSteamId),
          isGameDetailsPrivate: result?.isGameDetailsPrivate || false,
          achievements: []
        });
      }

      return status(200, result);
    },
    {
      params: z.object({
        identifier: z.string()
      })
    }
  )

  /**
   * Get Steam owned games & playtimes
   */
  .get('/games', async ({ db, userId, status }) => {
    let targetSteamId: string | undefined;

    if (userId) {
      const userRepo = createUserRepository(db);
      const user = await userRepo.findById(userId);
      const linkedSteamId = user?.socials?.steamId;
      targetSteamId =
        linkedSteamId && STEAM_ID_PATTERN.test(linkedSteamId) ? linkedSteamId : undefined;
    }

    if (!targetSteamId) {
      return status(404, { message: 'Nenhuma conta Steam vinculada.' });
    }

    const games = await steamService.getOwnedGames(targetSteamId);
    return status(200, { games });
  });

export const steamAuthRouter = new Elysia({ prefix: '/auth/steam' })
  .use(databaseMiddleware)
  .use(authMiddleware)

  /**
   * Redirect to Steam OpenID Login
   */
  .get(
    '/',
    async ({ query, redirect, cookie }) => {
      const state = await createOAuthState({ provider: 'steam' });
      const returnPath = getSafeReturnPath(query.returnTo);

      cookie.steam_return_to.set({
        value: returnPath,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: envs.app.NODE_ENV === 'prod',
        maxAge: STEAM_STATE_TTL_SECONDS
      });

      cookie.steam_oauth_state.set({
        value: state,
        httpOnly: true,
        path: '/auth/steam',
        sameSite: 'lax',
        secure: envs.app.NODE_ENV === 'prod',
        maxAge: STEAM_STATE_TTL_SECONDS
      });

      const returnUrl = `${envs.auth.AUTH_CALLBACK_URL}/auth/steam/callback?state=${encodeURIComponent(
        state
      )}`;
      const callbackOrigin = new URL(envs.auth.AUTH_CALLBACK_URL);
      const realm = `${callbackOrigin.protocol}//${callbackOrigin.host}/`;
      const openIdUrl = steamService.createOpenIdUrl(returnUrl, realm);

      return redirect(openIdUrl, 302);
    },
    {
      query: z.object({
        returnTo: z.string().optional()
      })
    }
  )

  /**
   * Steam OpenID Callback
   */
  .get('/callback', async ({ query, db, userId, redirect, cookie }) => {
    const state = typeof query.state === 'string' ? query.state : null;
    const cookieState =
      typeof cookie.steam_oauth_state?.value === 'string' ? cookie.steam_oauth_state.value : null;
    const returnTarget = getSafeReturnPath(
      typeof cookie.steam_return_to?.value === 'string' ? cookie.steam_return_to.value : undefined
    );
    cookie.steam_return_to?.remove();
    cookie.steam_oauth_state?.remove();
    const dest = `${envs.app.CLIENT_URL}${returnTarget}`;
    const finalRedirect = dest.includes('?')
      ? `${dest}&steam=connected`
      : `${dest}?steam=connected`;

    if (!state || !cookieState || state !== cookieState) {
      const errDest = dest.includes('?') ? `${dest}&steam=error` : `${dest}?steam=error`;
      return redirect(errDest, 302);
    }

    const oauthState = await consumeOAuthState(state, 'steam');
    if (!oauthState) {
      const errDest = dest.includes('?') ? `${dest}&steam=error` : `${dest}?steam=error`;
      return redirect(errDest, 302);
    }

    const queryParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(query)) {
      if (typeof v === 'string') queryParams[k] = v;
    }

    const steamId = await steamService.verifyOpenIdCallback(queryParams);

    if (!steamId) {
      const errDest = dest.includes('?') ? `${dest}&steam=error` : `${dest}?steam=error`;
      return redirect(errDest, 302);
    }

    const summary = await steamService.getPlayerSummary(steamId);
    const userRepo = createUserRepository(db);
    const oauthRepo = createOAuthAccountRepository(db);

    // If already logged in, link Steam to current user
    if (userId) {
      const user = await userRepo.findById(userId);
      if (user) {
        const existingAccount = await oauthRepo.findByProvider('steam', steamId);
        if (existingAccount && existingAccount.userId !== userId) {
          const errDest = dest.includes('?') ? `${dest}&steam=error` : `${dest}?steam=error`;
          return redirect(errDest, 302);
        }
        const currentSocials = user.socials || {};
        const updatedSocials = {
          ...currentSocials,
          steam: summary?.personaName || steamId,
          steamId,
          steamPublic: currentSocials.steamPublic ?? true
        };

        await executeTransaction(db, async (tx) => {
          await tx.update(users).set({ socials: updatedSocials }).where(eq(users.id, userId));
          if (!existingAccount) {
            await oauthRepo.create({ provider: 'steam', providerId: steamId, userId }, tx);
          }
        });
      }
      return redirect(finalRedirect, 302);
    }

    // If not logged in, find or create OAuth account
    const result = await executeTransaction(db, async (tx) => {
      const existingAccount = await oauthRepo.findByProvider('steam', steamId);

      let targetUserId: string;
      if (existingAccount) {
        targetUserId = existingAccount.userId;
      } else {
        const newUser = await userRepo.createWithoutEmail(tx);
        targetUserId = newUser.id;

        if (summary) {
          await (tx ?? db)
            .update(users)
            .set({
              displayName: summary.personaName || undefined,
              avatarUrl: summary.avatarUrl || undefined,
              socials: {
                steam: summary.personaName || steamId,
                steamId,
                steamPublic: true
              }
            })
            .where(eq(users.id, targetUserId));
        }

        await oauthRepo.create(
          {
            provider: 'steam',
            providerId: steamId,
            userId: targetUserId
          },
          tx
        );
      }

      const sessionToken = await createSession(targetUserId);
      return { sessionToken };
    });

    if (result?.sessionToken) {
      cookie.session.set({
        value: result.sessionToken,
        httpOnly: true,
        secure: envs.app.NODE_ENV === 'prod',
        sameSite: 'lax',
        path: '/'
      });
    }

    return redirect(finalRedirect, 302);
  });
