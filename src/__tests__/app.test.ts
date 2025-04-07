import { fastify } from '~root/test/fastify';

describe('Test server health', () => {
  it('serve GET /', async () => {
    const res = await fastify.inject('/');

    expect(res.json()).toStrictEqual({ hello: 'world' });
  });
});
