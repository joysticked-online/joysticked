import { Elysia } from 'elysia';

import { createProfileRouter } from './create-profile/router';
import { getProfileByUsernameRouter } from './get-profile-by-username/router';
import { getProfileRouter } from './get-profile/router';
import { updateProfileRouter } from './update-profile/router';

export const profileRouter = new Elysia({ prefix: '/profile', tags: ['profile'] })
  .use(createProfileRouter)
  .use(getProfileRouter)
  .use(getProfileByUsernameRouter)
  .use(updateProfileRouter);

