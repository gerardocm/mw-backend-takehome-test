import { beforeAll, afterAll } from 'vitest'
import { app } from '@app/app'

export const fastify = app()

interface MockOrm {
  getRepository: () => {
    insert: () => void
  }
}

const dataMocks = vi.hoisted(() => {
  const baseURL = 'https://baseurl.com'
  return {
    baseURL,
    superCarSuccessResponseMock: {
      status: 200,
      statusText: 'OK',
      data: {
        vin: '2HSCNAPRX7C385251',
        registrationDate: '2012-06-14T00:00:00.0000000',
        plate: {
          year: 2012,
          month: 4,
        },
        valuation: {
          lowerValue: 22350,
          upperValue: 24750,
        },
      },
      config: {
        baseURL,
        metadata: {
          startData: new Date(),
          endData: new Date()
        }
      }
    }
  };
});

beforeAll(async () => {
  // Mock the database plugin
  vi.mock('typeorm-fastify-plugin', () => ({
    default: () => {
      fastify.decorate<MockOrm>('orm', {
        getRepository: () => ({
          insert: vi.fn().mockImplementation(( {vrm }: { vrm: string }) => {
            return new Promise((resolve, reject) => {
              if (vrm == 'invalid') {
                reject({err:{code: 'Unknown error'}})
              } else {
                resolve(null)

              }
            });
          }),
          findOneBy: vi.fn().mockImplementation(( {vrm }: { vrm: string }) => {
            return new Promise((resolve) => {
              if (vrm == 'abc') {
                resolve({
                  vrm: 'abc',
                  lowerValue: 22350,
                  upperValue: 24750,
                  midpointValue: () => {
                    return (24750+22350)/2
                  }
                });
              } else {
                resolve(null)
              }
            });
          }),
          createQueryBuilder: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          andWhere: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          getCount: vi.fn().mockResolvedValue(10),
          getOne: vi.fn().mockResolvedValue({
            vrm: 'ABC123',
            lowerValue: 22350,
            upperValue: 24750,
          })
        })
      })
      return Promise.resolve()
    }
  }))

  vi.mock('axios', () => {
    return {
      default: {
        get: vi.fn().mockResolvedValue(dataMocks.superCarSuccessResponseMock),
        isAxiosError: vi.fn().mockReturnValue(true),
        create: vi.fn().mockReturnThis(),
        config: {
          baseURL: dataMocks.baseURL,
          metadata: {
            startData: new Date(),
            endData: new Date()
          }
        },
        defaults: {
          baseURL: dataMocks.baseURL,
        },
        interceptors: {
          request: {
            use: vi.fn()
          },
          response: {
            use: vi.fn()
          }
        }
      },
      HttpStatusCode: {
        ServiceUnavailable: '503'
      },
    };
  });

  // called once before all tests run
  await fastify.ready()
})

afterAll(async () => {
  // called once after all tests run
  // vi.restoreAllMocks()
  await fastify.close()
})
