import { Elysia, t } from 'elysia';
import { getGameDetails, getTimeToBeat } from './use-case';

export const getGameRouter = new Elysia()
  .get(
    '/:slug/time-to-beat',
    async ({ params, set }) => {
      const timeToBeat = await getTimeToBeat(Number(params.slug));
      if (!timeToBeat) {
        set.status = 404;
        return { message: 'Tempo para zerar não encontrado.' };
      }
      return { timeToBeat };
    },
    { params: t.Object({ slug: t.String() }) }
  )
  .get(
    '/:slug',
    async ({ params, set }) => {
      const result = await getGameDetails(params.slug);
      if (!result) {
        set.status = 404;
        return { message: 'Jogo não encontrado.' };
      }
      return result;
    },
    { params: t.Object({ slug: t.String() }) }
  );
