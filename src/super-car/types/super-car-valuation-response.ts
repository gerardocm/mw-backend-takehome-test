import { Plate } from './plate';
import { SuperCarValuation } from './super-car-valuation';

export type SuperCarValuationResponse = {
  vin: string;
  registrationDate: string;
  plate: Plate;
  valuation: SuperCarValuation;
};
