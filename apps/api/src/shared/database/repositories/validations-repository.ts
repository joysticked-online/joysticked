import { and, desc, eq, isNull } from 'drizzle-orm';

import { InternalServerError } from '../../../shared/errors/internal-server-error';
import type { Database } from '..';
import { type Validation, validations } from '../schemas';
import type { Transaction } from '../transaction';

class ValidationRepository {
  constructor(private readonly db: Database) {}

  async findByIdAndType({ id, type }: { id: Validation['id']; type: Validation['type'] }) {
    const validationRequest = await this.db
      .select()
      .from(validations)
      .where(and(eq(validations.id, id), eq(validations.type, type)));

    if (!validationRequest[0]) return null;

    return validationRequest[0];
  }

  async findUnusedByIdentifierAndType({
    identifier,
    type
  }: {
    identifier: Validation['identifier'];
    type: Validation['type'];
  }) {
    const validationRequest = await this.db
      .select()
      .from(validations)
      .where(
        and(
          eq(validations.identifier, identifier),
          eq(validations.type, type),
          isNull(validations.usedAt)
        )
      )
      .orderBy(desc(validations.createdAt))
      .limit(1);

    if (!validationRequest[0]) return null;

    return validationRequest[0];
  }

  async findByIdentifierAndType({
    identifier,
    type
  }: {
    identifier: Validation['identifier'];
    type: Validation['type'];
  }) {
    const validationRequest = await this.db
      .select()
      .from(validations)
      .where(and(eq(validations.identifier, identifier), eq(validations.type, type)))
      .orderBy(desc(validations.createdAt))
      .limit(1);

    if (!validationRequest[0]) return null;

    return validationRequest[0];
  }

  async findAllUnusedByType({
    type,
    identifier
  }: {
    type: Validation['type'];
    identifier: Validation['identifier'];
  }) {
    const codes = await this.db
      .select()
      .from(validations)
      .where(
        and(
          eq(validations.identifier, identifier),
          isNull(validations.usedAt),
          eq(validations.type, type)
        )
      );

    return codes;
  }

  async deleteAllUnusedByIdentifierAndType(
    {
      identifier,
      type
    }: {
      identifier: Validation['identifier'];
      type: Validation['type'];
    },
    tx?: Transaction
  ) {
    await (tx ?? this.db)
      .delete(validations)
      .where(
        and(
          eq(validations.identifier, identifier),
          isNull(validations.usedAt),
          eq(validations.type, type)
        )
      );
  }

  async create(
    {
      identifier,
      code,
      type
    }: {
      identifier: Validation['identifier'];
      code: Validation['code'];
      type: Validation['type'];
    },
    tx?: Transaction
  ) {
    const validationRequest = await (tx ?? this.db)
      .insert(validations)
      .values({ identifier, code, type })
      .returning();

    if (!validationRequest[0]) throw new InternalServerError('Failed to create validation');

    return validationRequest[0];
  }

  async markAsUsed(id: Validation['id']) {
    await this.db.update(validations).set({ usedAt: new Date() }).where(eq(validations.id, id));
  }

  async delete(id: Validation['id']) {
    await this.db.delete(validations).where(eq(validations.id, id));
  }
}

export function createValidationRepository(db: Database) {
  return new ValidationRepository(db);
}
