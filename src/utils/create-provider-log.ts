import { Providers } from '@app/constants/providers';
import { ProviderLog } from '@app/models/provider-log';
import { AxiosError, AxiosResponse } from 'axios';

export const createProviderLogFromAxiosResponse = (
  response: AxiosResponse,
  provider: Providers,
  vrm: string,
) => {
  const providerLog = new ProviderLog();
  providerLog.vrm = vrm;
  providerLog.code = `${response.status}`;
  providerLog.duration = response.duration;
  providerLog.provider = provider;
  providerLog.timestamp = response.config.metadata?.startTime;
  providerLog.url = response.config.baseURL;
  return providerLog;
};

export const createProviderLogFromAxiosError = (
  error: AxiosError,
  provider: Providers,
  vrm: string,
) => {
  const providerLog = new ProviderLog();
  providerLog.vrm = vrm;
  providerLog.code = `${error.response?.status}`;
  providerLog.duration = error?.duration;
  providerLog.provider = provider;
  providerLog.timestamp = error?.config?.metadata?.startTime;
  providerLog.url = error?.config?.baseURL;
  providerLog.error = error?.message;
  return providerLog;
};
