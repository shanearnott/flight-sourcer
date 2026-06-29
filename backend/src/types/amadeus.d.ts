declare module 'amadeus' {
  interface AmadeusOptions {
    clientId: string;
    clientSecret: string;
    hostname?: 'test' | 'production';
    logLevel?: 'silent' | 'warn' | 'debug';
  }

  interface AmadeusResponse {
    data: unknown[];
    result?: {
      dictionaries?: {
        carriers?: Record<string, string>;
      };
    };
  }

  class Amadeus {
    constructor(options: AmadeusOptions);
    referenceData: {
      locations: {
        get(params: Record<string, unknown>): Promise<AmadeusResponse>;
      };
    };
    shopping: {
      flightOffersSearch: {
        get(params: Record<string, unknown>): Promise<AmadeusResponse>;
      };
    };
  }

  export default Amadeus;
}
