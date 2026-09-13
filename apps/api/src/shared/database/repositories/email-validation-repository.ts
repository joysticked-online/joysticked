import { and, desc, eq, isNull } from 'drizzle-orm';

import type { Database } from '..';
import { type EmailValidation, emailValidations } from '../schemas';
import type { Transaction } from '../transaction';

type CreateEmailValidation = Pick<EmailValidation, 'identifier' | 'otpHash' | 'expiresAt'>;

type ConsumeEmailValidationResult =
  | { kind: 'success'; validation: EmailValidation }
  | { kind: 'missing' | 'expired' | 'exhausted' | 'invalid' };

class EmailValidationRepository {
  constructor(private readonly db: Database) {}

  async deleteActive(identifier: string, tx?: Transaction) {
    await (tx ?? this.db)
      .delete(emailValidations)
      .where(and(eq(emailValidations.identifier, identifier), isNull(emailValidations.usedAt)));
  }

  async create(data: CreateEmailValidation, tx?: Transaction) {
    const result = await (tx ?? this.db).insert(emailValidations).values(data).returning();
    return result[0] ?? null;
  }

  async consume(
    {
      id,
      otp,
      verifyOtp
    }: {
      id: EmailValidation['id'];
      otp: string;
      verifyOtp: (otp: string, hash: string) => Promise<boolean>;
    },
    tx: Transaction
  ): Promise<ConsumeEmailValidationResult> {
    const result = await tx
      .select()
      .from(emailValidations)
      .where(eq(emailValidations.id, id))
      .for('update');
    const validation = result[0];

    if (!validation) return { kind: 'missing' };
    if (validation.usedAt) return { kind: 'exhausted' };
    if (validation.expiresAt <= new Date()) return { kind: 'expired' };
    if (validation.attempts >= validation.maxAttempts) return { kind: 'exhausted' };

    const valid = await verifyOtp(otp, validation.otpHash);
    if (!valid) {
      await tx
        .update(emailValidations)
        .set({ attempts: validation.attempts + 1 })
        .where(eq(emailValidations.id, id));
      return { kind: 'invalid' };
    }

    const consumed = await tx
      .update(emailValidations)
      .set({ usedAt: new Date() })
      .where(and(eq(emailValidations.id, id), isNull(emailValidations.usedAt)))
      .returning();

    return consumed[0] ? { kind: 'success', validation: consumed[0] } : { kind: 'exhausted' };
  }

  async findById(id: EmailValidation['id'], tx?: Transaction) {
    const result = await (tx ?? this.db)
      .select()
      .from(emailValidations)
      .where(eq(emailValidations.id, id))
      .orderBy(desc(emailValidations.createdAt))
      .limit(1);
    return result[0] ?? null;
  }
}

export function createEmailValidationRepository(db: Database) {
  return new EmailValidationRepository(db);
}
