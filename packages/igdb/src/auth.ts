import { fetch } from 'bun';
import { z } from 'zod';

import { version } from '../package.json';
import type { IGDBAPIResponse, ValidationError } from '../types';

const exchangeTwitchAuthTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.literal('bearer')
});

type TwitchAuthToken = z.infer<typeof exchangeTwitchAuthTokenSchema>;

function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message
  }));
}

export async function exchangeTwitchAuthToken({
  client_id,
  client_secret
}: {
  client_id: string;
  client_secret: string;
}): Promise<IGDBAPIResponse<TwitchAuthToken>> {
  try {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': `joysticked-igdb-node/${version}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();

      return {
        data: null,
        error: {
          message: error?.message ?? 'Unknown error'
        }
      };
    }

    const data = await response.json();

    // Validate the response data
    const validationResult = exchangeTwitchAuthTokenSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        data: null,
        error: {
          message: 'Response validation failed',
          validation_errors: formatZodErrors(validationResult.error)
        }
      };
    }

    return {
      data: validationResult.data,
      error: null
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        data: null,
        error: {
          message: error.message
        }
      };
    }

    const errorMessage =
      error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Unknown error';

    return {
      data: null,
      error: {
        message: errorMessage
      }
    };
  }
}
