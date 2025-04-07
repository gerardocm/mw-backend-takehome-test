import { FastifyInstance } from 'fastify';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
import { fetchValuationFromSuperCarValuation } from '@app/super-car/super-car-valuation';
import { fetchValuationFromPremiumCarValuation } from '@app/premium-car/premium-car-valuation';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { ProviderLog } from '@app/models/provider-log';
import { Providers } from '@app/constants/providers';
import { FallbackLog } from '@app/models/fallback-log';
import axios, { HttpStatusCode } from 'axios';

export function valuationRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;

    if (vrm === null || vrm === '' || vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    const result = await valuationRepository.findOneBy({ vrm: vrm });

    if (result == null) {
      return reply.code(404).send({
        message: `Valuation for VRM ${vrm} not found`,
        statusCode: 404,
      });
    }

    fastify.log.info('Valuation retrieved: ', result);

    return result;
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const logsRepository = fastify.orm.getRepository(ProviderLog);
    const fallbackRepository = fastify.orm.getRepository(FallbackLog);

    const { vrm } = request.params;
    const { mileage } = request.body;

    if (vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    if (mileage === null || mileage <= 0) {
      return reply.code(400).send({
        message: 'mileage must be a positive number',
        statusCode: 400,
      });
    }

    // Check if valuation has already been done previously
    const dbValuation = await valuationRepository.findOneBy({ vrm: vrm });
    if (dbValuation) {
      fastify.log.info(
        `Valuation ${dbValuation.vrm} already exists on DB. Returning existing valuation.`,
      );
      return dbValuation;
    }

    // Variable to either use fallback api or not
    let useFallback = false;

    // Retrieve last fallback started at
    const lastFallback = await fallbackRepository
      .createQueryBuilder('log')
      .orderBy('log.fallbackStartedAt', 'DESC')
      .getOne();

    // Fallback reset time is default to 10 minutes
    const resetTimeRange =
      parseInt(process.env.RESET_TIME as string) ?? 10 * 60 * 1000;
    const now = new Date();

    let resetDatetime = undefined;
    if (lastFallback?.fallbackStartedAt) {
      resetDatetime = new Date(lastFallback?.fallbackStartedAt);
      // Sets the time from when the requests should count for rate calculation
      resetDatetime.setTime(resetDatetime.getTime() + resetTimeRange);
    }

    // If reset date time is in the future, fallback should still be used
    if (!resetDatetime || resetDatetime < now) {
      const rateTimeRange =
        parseInt(process.env.RATE_TIME_RANGE as string) ?? 10 * 60 * 1000;
      let timeAtRange = new Date();
      timeAtRange.setTime(new Date().getTime() - rateTimeRange);

      // If reset date time is in the past, time range for rate should be the closest to now (have the least difference)
      if (
        resetDatetime &&
        now.getTime() - resetDatetime.getTime() <
          now.getTime() - timeAtRange.getTime()
      ) {
        timeAtRange = resetDatetime;
      }

      // Get the total of requests within the range time configured
      const total = await logsRepository
        .createQueryBuilder('log')
        .where('log.provider == :provider', { provider: Providers.SuperCar })
        .andWhere('log.timestamp >= :timeAtRange', { timeAtRange })
        .getCount();

      // Get count of successful requests within the range time configured
      const success = await logsRepository
        .createQueryBuilder('log')
        .where('log.provider == :provider', { provider: Providers.SuperCar })
        .andWhere('log.code == :code', { code: '200' })
        .andWhere('log.timestamp >= :timeAtRange', { timeAtRange })
        .getCount();

      // Failure request is any other request that is not 200
      const failureRate = 1 - success / total;
      // Minimum number of requests to calculate the rate
      const minReqRate = parseInt(process.env.MIN_REQ_4_RATE as string) ?? 0;
      // Fallback reset time is default to 10 minutes
      const failureRateThreshold =
        parseFloat(process.env.FAILURE_RATE_THRESHOLD as string) ?? 0.2;

      // Uses fallback when failure rate is above threashold
      if (total >= minReqRate && failureRate > failureRateThreshold) {
        useFallback = true;
        // Store fallback usage on DB
        fallbackRepository
          .insert({ provider: Providers.PremiumCar })
          .catch((err) => {
            fastify.log.error(err);
          });
      }
    } else if (resetDatetime && resetDatetime >= now) {
      // Fallback still active since reset time has not been reached yet
      useFallback = true;
    }

    let valuation = null;
    try {
      if (useFallback) {
        // Use Fallback (Premium Car) Valuations endpoint
        valuation = await fetchValuationFromPremiumCarValuation(
          vrm,
          mileage,
          fastify,
        );
      } else {
        // Use Super Car Valuations endpoint
        valuation = await fetchValuationFromSuperCarValuation(
          vrm,
          mileage,
          fastify,
        );
      }
    } catch (err) {
      // If both services are unreachable returns a 503 error
      if (axios.isAxiosError(err)) {
        // Throws 503 error
        err.status = HttpStatusCode.ServiceUnavailable;
        err.message = 'Third-party services are unavailable.';
        throw err;
      }
      throw err;
    }

    if (valuation) {
      // Save to DB.
      await valuationRepository.insert(valuation).catch((err) => {
        if (err.code !== 'SQLITE_CONSTRAINT') {
          throw err;
        }
      });
    } else {
      // Return an error invalid valuation
      throw { msg: 'Error: Invalid valuation' };
    }

    return valuation;
  });
}
