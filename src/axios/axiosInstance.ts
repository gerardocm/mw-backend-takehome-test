import axios, { AxiosError, CreateAxiosDefaults } from 'axios';

interface ConfigMetadata {
  startTime?: Date;
  endTime?: Date;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: ConfigMetadata;
  }

  export interface AxiosResponse {
    metadata?: ConfigMetadata;
    duration?: number;
  }

  export interface AxiosError {
    duration?: number;
  }
}

export const createAxiosInstance = (config: CreateAxiosDefaults) => {
  const instance = axios.create(config);

  // Sets the response start time to calculate the duration
  instance.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: new Date() };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Calculates response duration
  instance.interceptors.response.use(
    (response) => {
      if (response.config.metadata) {
        response.config.metadata.endTime = new Date();
        if (response.config.metadata.startTime) {
          response.duration =
            response.config.metadata.endTime.getTime() -
            response.config.metadata.startTime.getTime();
        }
      }
      return response;
    },
    (error: Error | AxiosError) => {
      if (axios.isAxiosError(error) && error.config && error.config.metadata) {
        error.config.metadata.endTime = new Date();
        if (error.config.metadata.startTime) {
          error.duration =
            error.config.metadata.endTime.getTime() -
            error.config.metadata.startTime.getTime();
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};
