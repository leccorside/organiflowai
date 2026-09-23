import { ORGANIZATION_ROLES } from '@aom/types';
import { describe, expect, it } from 'vitest';
import { OrganizationRole } from './generated/prisma/enums';

// Garante que os enums do banco não divergem dos contratos compartilhados com o frontend.
describe('paridade Prisma × @aom/types', () => {
  it('OrganizationRole espelha ORGANIZATION_ROLES', () => {
    expect(Object.values(OrganizationRole)).toEqual([...ORGANIZATION_ROLES]);
  });
});
