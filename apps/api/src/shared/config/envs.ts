import { z } from 'zod';

export const envs = {
  app: loadAppEnvs()
};

function loadAppEnvs() {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod']).default('dev'),
    PORT: z.coerce.number().default(3333)
  });

  return schema.parse(Bun.env);
}
