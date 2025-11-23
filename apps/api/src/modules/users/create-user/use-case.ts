import type { Database } from '../../../shared/database';
import { createUsersRepository } from '../../../shared/database/repositories/users-repository';
import { createValidationRepository } from '../../../shared/database/repositories/validations-repository';
import { ConflictError } from '../../../shared/errors/conflict-error';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import type { CreateUser } from './schemas';

export async function createUserUseCase(db: Database, data: CreateUser) {
  const validationsRepository = createValidationRepository(db);

  const emailValidationRequest = await validationsRepository.findByIdAndType({
    id: data.emailValidationRequestId,
    type: 'email'
  });

  if (!emailValidationRequest) {
    throw new ResourceNotFoundError('Email validation request not found');
  }

  if (!emailValidationRequest.usedAt) {
    throw new ConflictError('Please validate your email first');
  }

  const userRepository = createUsersRepository(db);

  const userAlreadyExists = await userRepository.findByFirstIdentifier({
    username: data.username,
    email: emailValidationRequest.identifier
  });

  if (userAlreadyExists) {
    throw new ConflictError('User already exists');
  }

  return await userRepository.create({
    bio: data.bio,
    socials: data.socials,
    pronouns: data.pronouns,
    location: data.location,
    username: data.username,
    avatarUrl: data.avatarUrl,
    bannerUrl: data.bannerUrl,
    isPrivate: data.isPrivate,
    email: emailValidationRequest.identifier
  });
}
