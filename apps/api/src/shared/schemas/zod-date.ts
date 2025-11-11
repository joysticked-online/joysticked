import { z } from 'zod';

import { overrideJSONSchema } from '../utils/override-json-schema';

const datetime = z.iso.datetime();

export const zDate = overrideJSONSchema(
  z.codec(datetime, z.date(), {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString()
  }),
  () => z.toJSONSchema(datetime)
);
