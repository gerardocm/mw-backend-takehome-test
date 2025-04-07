import { fastify } from '~root/test/fastify';
import { createAxiosInstance } from '../axiosInstance';

describe('Create Axios Instance', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const load = fastify;
  });

  it('should create axios instance', async () => {
    const instance = createAxiosInstance({});
    expect(instance).toBeTruthy();
  });

  it('should create axios instance with base url', async () => {
    const testBaseUrl = 'https://baseurl.com';
    const instance = createAxiosInstance({ baseURL: testBaseUrl });
    expect(instance.defaults.baseURL).toEqual(testBaseUrl);
  });
});
