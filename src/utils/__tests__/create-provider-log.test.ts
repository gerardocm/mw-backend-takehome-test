import {
  createProviderLogFromAxiosError,
  createProviderLogFromAxiosResponse,
} from '../create-provider-log';
import { AxiosError, AxiosResponse } from 'axios';
import { Providers } from '@app/constants/providers';

describe('Create Provider Log Instance', () => {
  it('should create a Provider Log instance from axios response', async () => {
    const vrm = 'vrm1234';
    const baseURL = 'https://baseurl.com';
    const providerLog = createProviderLogFromAxiosResponse(
      {
        status: 200,
        duration: 50,
        config: {
          metadata: { startTime: new Date() },
          baseURL,
        },
      } as AxiosResponse,
      Providers.PremiumCar,
      vrm,
    );

    expect(providerLog.code).toBe('200');
    expect(providerLog.duration).toBe(50);
    expect(providerLog.url).toBe(baseURL);
    expect(providerLog.provider).toBe(Providers.PremiumCar);
    expect(providerLog.vrm).toBe(vrm);
  });

  it('should create a Provider Log instance from axios error', async () => {
    const vrm = 'vrm1234';
    const baseURL = 'baseUrl.com';
    const errorMessage = 'Test error message';
    const providerLog = createProviderLogFromAxiosError(
      {
        response: {
          status: 200,
        },
        duration: 50,
        config: {
          metadata: { startTime: new Date() },
          baseURL,
        },
        message: errorMessage,
      } as AxiosError,
      Providers.PremiumCar,
      vrm,
    );

    expect(providerLog.code).toBe('200');
    expect(providerLog.duration).toBe(50);
    expect(providerLog.url).toBe(baseURL);
    expect(providerLog.provider).toBe(Providers.PremiumCar);
    expect(providerLog.vrm).toBe(vrm);
    expect(providerLog.error).toBe(errorMessage);
  });
});
