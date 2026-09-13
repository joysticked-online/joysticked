import { deleteSession } from '../../../shared/providers/session';

export async function logoutUseCase(sessionToken?: string | null) {
  if (sessionToken) {
    await deleteSession(sessionToken);
  }
  return { message: 'Logged out successfully' };
}
