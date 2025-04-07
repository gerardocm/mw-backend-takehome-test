import { FastifyInstance } from 'fastify';
import { VehicleValuation } from '../models/vehicle-valuation';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';
import { createAxiosInstance } from '@app/axios/axiosInstance';
import {
  createProviderLogFromAxiosError,
  createProviderLogFromAxiosResponse,
} from '@app/utils/create-provider-log';
import { Providers } from '@app/constants/providers';
import axios from 'axios';
import { ProviderLog } from '@app/models/provider-log';

export async function fetchValuationFromSuperCarValuation(
  vrm: string,
  mileage: number,
  fastify: FastifyInstance,
): Promise<VehicleValuation> {
  const providerLogsRepository = fastify.orm.getRepository(ProviderLog);
  try {
    const axios = createAxiosInstance({
      baseURL: process.env.SUPER_CAR_VALUATIONS_URL,
    });
    const response = await axios.get<SuperCarValuationResponse>(
      `valuations/${vrm}?mileage=${mileage}`,
    );

    const providerLog = createProviderLogFromAxiosResponse(
      response,
      Providers.SuperCar,
      vrm,
    );
    await providerLogsRepository.insert(providerLog).catch((err) => {
      if (err.code !== 'SQLITE_CONSTRAINT') {
        fastify.log.error(err);
      }
    });

    const valuation = new VehicleValuation();
    valuation.vrm = vrm;
    valuation.provider = Providers.SuperCar;
    valuation.lowestValue = response.data.valuation.lowerValue;
    valuation.highestValue = response.data.valuation.upperValue;

    return valuation;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const providerLog = createProviderLogFromAxiosError(
        err,
        Providers.SuperCar,
        vrm,
      );
      await providerLogsRepository.insert(providerLog).catch((err) => {
        if (err.code !== 'SQLITE_CONSTRAINT') {
          fastify.log.error(err);
        }
      });
    }
    throw err;
  }
}
