import { fastify } from '~root/test/fastify';
import axios from 'axios';
import { fetchValuationFromSuperCarValuation } from '../super-car-valuation';

describe('Super Car Valuation Service ', () => {
  it('should create a Provider Log instance from axios response', async () => {
    const vrm = 'vrmtest';
    const valuations = await fetchValuationFromSuperCarValuation(
      vrm,
      10000,
      fastify,
    );

    expect(valuations.highestValue).toBe(24750);
    expect(valuations.lowestValue).toBe(22350);
    expect(valuations.vrm).toBe(vrm);
  });

  it('should create a Provider Log instance from axios error', async () => {
    const vrm = 'vrmtest';
    vi.spyOn(axios, 'get').mockRejectedValueOnce({
      response: {
        status: 500,
      },
      duration: 50,
      message: 'Test error message',
      config: {
        baseUrl: 'https://baseurl.com',
        metadata: {
          startTime: 'startTime',
          endTime: 'endTime',
        },
      },
    });

    try {
      await fetchValuationFromSuperCarValuation(vrm, 10000, fastify);
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
