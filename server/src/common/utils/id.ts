import { BadRequestException } from '@nestjs/common';

/**
 * Converts route or token ids to BigInt for Prisma models.
 *
 * Context: database ids are BigInt, while JWT payloads and HTTP params must be
 * serialized as strings. Keeping the conversion here avoids scattered parsing
 * rules and gives clients a consistent bad-request error for malformed ids.
 */
export function toBigIntId(value: string, fieldName = 'id') {
  if (!/^\d+$/.test(value)) {
    throw new BadRequestException(`${fieldName} 无效`);
  }

  return BigInt(value);
}
