import { Providers } from './../constants/providers';
import { createAxiosInstance } from '@app/axios/axiosInstance';
import { VehicleValuation } from '../models/vehicle-valuation';
import { PremiumCarValuationResponse } from './types/premium-car-valuation-response';
import { XMLParser } from 'fast-xml-parser';
import { FastifyInstance } from 'fastify';
import { ProviderLog } from '@app/models/provider-log';
import {
  createProviderLogFromAxiosError,
  createProviderLogFromAxiosResponse,
} from '@app/utils/create-provider-log';
import axios from 'axios';

export async function fetchValuationFromPremiumCarValuation(
  vrm: string,
  mileage: number,
  fastify: FastifyInstance,
): Promise<VehicleValuation> {
  const providerLogsRepository = fastify.orm.getRepository(ProviderLog);

  try {
    const axios = createAxiosInstance({
      baseURL: process.env.PREMIUM_CAR_VALUATIONS_URL,
    });

    const response = await axios.get<string>(
      `valuations/${vrm}?mileage=${mileage}`,
    );

    const providerLog = createProviderLogFromAxiosResponse(
      response,
      Providers.PremiumCar,
      vrm,
    );
    await providerLogsRepository.insert(providerLog).catch((err) => {
      if (err.code !== 'SQLITE_CONSTRAINT') {
        fastify.log.error(err);
      }
    });

    const xmlString = response.data as string;
    const parser = new XMLParser();
    const jsonData: { Response: PremiumCarValuationResponse } =
      parser.parse(xmlString);
    const valuation = new VehicleValuation();

    valuation.vrm = vrm;
    valuation.provider = Providers.SuperCar;
    valuation.lowestValue = parseInt(
      jsonData.Response.ValuationPrivateSaleMinimum,
    );
    valuation.highestValue = parseInt(
      jsonData.Response.ValuationPrivateSaleMaximum,
    );

    return valuation;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const providerLog = createProviderLogFromAxiosError(
        err,
        Providers.PremiumCar,
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
