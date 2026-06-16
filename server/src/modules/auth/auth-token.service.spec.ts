import { JwtService } from '@nestjs/jwt';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  it('signs user tokens with user subject and type', async () => {
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('user-token'),
    } as unknown as JwtService;
    const service = new AuthTokenService(jwtService);

    await expect(service.signUserToken('12')).resolves.toBe('user-token');

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '12',
      type: 'user',
    });
  });

  it('signs admin tokens with admin subject, type and role', async () => {
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('admin-token'),
    } as unknown as JwtService;
    const service = new AuthTokenService(jwtService);

    await expect(service.signAdminToken('7', 'reviewer')).resolves.toBe(
      'admin-token',
    );

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '7',
      type: 'admin',
      role: 'reviewer',
    });
  });
});
