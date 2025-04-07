import { fastify } from '~root/test/fastify';
import { fetchValuationFromPremiumCarValuation } from '../premium-car-valuation';
import axios from 'axios';

describe('Premium Car Valuation Service ', () => {
  it('should create a Provider Log instance from axios response', async () => {
    const vrm = 'vrmtest';
    vi.spyOn(axios, 'get').mockResolvedValueOnce({
      data: `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <RegistrationDate>2012-06-14T00:00:00.0000000</RegistrationDate>
          <RegistrationYear>2001</RegistrationYear>
          <RegistrationMonth>10</RegistrationMonth>
          <ValuationPrivateSaleMinimum>11500</ValuationPrivateSaleMinimum>
          <ValuationPrivateSaleMaximum>12750</ValuationPrivateSaleMaximum>
          <ValuationDealershipMinimum>9500</ValuationDealershipMinimum>
          <ValuationDealershipMaximum>10275</ValuationDealershipMaximum>
        </Response>`,
      config: {
        baseUrl: '',
        metadata: {
          startData: new Date(),
          endData: new Date(),
        },
      },
    });

    const valuations = await fetchValuationFromPremiumCarValuation(
      vrm,
      10000,
      fastify,
    );

    expect(valuations.highestValue).toBe(12750);
    expect(valuations.lowestValue).toBe(11500);
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
      await fetchValuationFromPremiumCarValuation(vrm, 10000, fastify);
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
