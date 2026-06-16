import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns service health status', () => {
    const controller = new HealthController();

    expect(controller.check()).toEqual({
      status: 'ok',
      service: 'jlpt-practice-server',
    });
  });
});
