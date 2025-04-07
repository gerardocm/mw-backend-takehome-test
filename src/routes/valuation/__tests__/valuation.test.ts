import { fastify } from '~root/test/fastify';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';
import * as superCarValuation from '@app/super-car/super-car-valuation';
import { VehicleValuation } from '@app/models/vehicle-valuation';

describe('ValuationController (e2e)', () => {
  describe('PUT /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/12345678',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        // @ts-expect-error intentionally malformed payload
        mileage: null,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is negative', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: -1,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 500 if error occured while saving on db', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 1000,
      };

      const res = await fastify.inject({
        url: '/valuations/invalid',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(500);
    });

    it('should return 503 when third party is unreachable', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const spyFetch = vi
        .spyOn(superCarValuation, 'fetchValuationFromSuperCarValuation')
        .mockRejectedValueOnce({
          status: 500,
          message: 'Error test',
        });

      const res = await fastify.inject({
        url: '/valuations/abc123',
        body: requestBody,
        method: 'PUT',
      });

      expect(spyFetch).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toStrictEqual(503);
    });

    it('should return 200 with valid request', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      vi.spyOn(
        superCarValuation,
        'fetchValuationFromSuperCarValuation',
      ).mockResolvedValue({
        vrm: 'ABC123',
        lowestValue: 22350,
        highestValue: 24750,
      } as VehicleValuation);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(200);
    });

    it('should return 200 with existing vrm without using super car valuations', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const spyFetch = vi.spyOn(
        superCarValuation,
        'fetchValuationFromSuperCarValuation',
      );

      const res = await fastify.inject({
        url: '/valuations/abc',
        body: requestBody,
        method: 'PUT',
      });

      expect(spyFetch).toHaveBeenCalledTimes(0);
      expect(res.statusCode).toStrictEqual(200);
    });
  });

  describe('GET /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const res = await fastify.inject({
        url: '/valuations',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const res = await fastify.inject({
        url: '/valuations/12345678',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 404 with an invalid RVM', async () => {
      const res = await fastify.inject({
        url: '/valuations/abc123',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 200 with valid request', async () => {
      const res = await fastify.inject({
        url: '/valuations/abc',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(200);
    });
  });
});
