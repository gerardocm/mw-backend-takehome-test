# Description

The Motorway backend take home code test. Please read the description and the brief carefully before starting the test.

**There's no time limit so please take as long as you wish to complete the test, and to add/refactor as much as you think is needed to solve the brief. However, we recommend around 60 - 120 minutes as a general guide, if you run out of time, then don't worry.**

**For anything that you did not get time to implement _or_ that you would like to change/add but you didn't feel was part of the brief, please feel free to make a note of it at the bottom of this README.md file**

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development (local)
$ npm run dev

# production mode (deployed)
$ npm run start
```

## Test

```bash
# run all tests
$ npm run test

# test coverage
$ npm run test:coverage
```

## Current Solution

This API is a simple but important API for motorway that is responsible for retrieving valuations for cars from a 3rd party (SuperCar Valuations) by the VRM (Vehicle Registration Mark) and mileage.

- The API has two routes
	- A PUT (/valuations/{vrm}) request to create a valuation for a vehicle which accepts a small amount of input data and performs some simple validation logic.
	- A GET (/valuations/{vrm}) request to get an existing valuation. Returns 404 if no valuation for the vrm exists.

- The PUT operation handles calling a third-party API to perform the actual valuation, there is some rudimentary mapping logic between Motorway & 3rd party requests/responses.
- The PUT request is not truly idempotent so the 3rd party is called each time this operation is called and the code catches duplicate key exceptions when writing to the database.
- If the 3rd party is unreachable or returns a 5xx error, the service returns a 500 Internal Server Error.
- The outcome is stored in a database for future retrieval in the GET request.
- All the logic for the entire operation is within a single method in a single "service" class.
- A QA engineer has added some high-level tests.
- The tests for validation failures all pass.
- A simple happy path test is currently failing as the I/O calls for the database and 3rd party have not been isolated and the clients are trying to hit real resources with an invalid configuration.

## Task Brief

As this is such an important service to Motorway, a decision has been made to add a fallback 3rd party provider called Premium Car Valuations in case SuperCar Valuations is unavailable for a period of time. Before we add any more features, we need to fix the broken test.

Here are a full list of tasks that need to be completed:

**Tests**

- Modify the code/test so that the existing test suite passes and no I/O calls are made during the execution of the test suite.

- Add a test for the GET call.

- All new functionality should have test coverage in a new or updated existing test.

**Features**

- Introduce a basic failover mechanism to call the fallback 3rd party provider (Premium Car Valuations) in the event that the failure rate of the calls to SuperCar Valuations exceeds 50%. To keep the test simple, assume this service is running as a single instance. Feel free to discuss how you might solve it differently if the service was to execute in a multi-node cluster. Be mindful that this is a popular API, therefore the solution needs to be able to handle tracking the success rate of a large number of requests.

- As Premium Car Valuations is more expensive to use, there is a need to revert back to SuperCar Valuations after a configurable amount of time. At this point, the failure rate to indicate failover should be reset.

- If both providers are unreachable or return a 5xx error, then the service should now return a 503 Service Unavailable Error.

- To save costs by avoiding calling either 3rd party, improve the PUT operation so that the providers are not called if a valuation has already occurred. NOTE: This is to save costs, not for any consistency concerns between Motorway and the 3rd party. (Don't worry about concurrency, if two requests for the same route occur at the same time, either response can be saved).

- To help increase customer confidence regarding the valuation Motorway shows the user, there is a new requirement to show the name of the provider who provided the valuation to the user on the front end, e.g. "Valued by Trusted Company {X}", therefore the name of the provider that was used for the valuation needs to be persisted in the database and returned in the response.

- The service should be tolerant to older records where there is no detail of the provider (Backwards Compatible).

- Refactor the code as you see fit to ensure it is more readable, maintainable and extensible.

- To help with auditing service level agreements with the providers over an indefinite time period, there is a need to store the following details of the request:

    - Request date and time
    - Request duration
    - Request url
    - Response code
    - Error code/message if applicable and the
    - Name of the provider

    The details must be stored in a ProviderLogs table, which is correlated to a VRM, there could potentially be more than one log per VRM.


## 3rd Party APIs

For the purposes of this code test, simple mocks have been created use a service called [Mocky](https://designer.mocky.io/) with simple canned responses. Assume, that these would be real RESTful/SOAP services.

## 3rd Party OpenAPI Specs

Details of the existing 3rd party (SuperCar Valuations) and the new provider (Premium Car Valuations) can be found below.

To view the OpenAPI specifications for the 3rd Party APIs at the links below, first run the `npm run third-party-api:serve-docs` command.

### SuperCar Valuations

This is the current and preferred provider used for valuations, it is a fairly modern and cost-effective API.

The OpenAPI Specification can be found [here](http://localhost:3001/docs).

The URI for this test stub in Mocky is https://run.mocky.io/v3/9245229e-5c57-44e1-964b-36c7fb29168b.

### Premium Car Valuations

This is the proposed fallback provider to be used for valuations, it is an old service and costs significantly more for each call.

The OpenAPI Specification can be found [here](http://localhost:3002/docs).

The URI for this test stub in Mocky is https://run.mocky.io/v3/0dfda26a-3a5a-43e5-b68c-51f148eda473.


# Candidate Notes
Here is a place for you to put any notes regarding the changes you made and the reasoning and what further changes you wish to suggest.

## Temporary Mocky APIs
The following mocky API were created for the challenge purpose as provided urls were expired.

 - SuperCar Valuation https://run.mocky.io/v3/853fdbc1-9753-483e-8d79-3acff4a32ed3
  Secret link to delete Mocky API: https://designer.mocky.io/manage/delete/853fdbc1-9753-483e-8d79-3acff4a32ed3/pXgeOUz1SG5JzccbUj1A4eLZ41SUYPrCc5tg

 - Premium Car Valuations: https://run.mocky.io/v3/578b5cd5-b21f-464e-8d69-563c0ce9a58a
 Secret link to delete Mocky API: https://designer.mocky.io/manage/delete/578b5cd5-b21f-464e-8d69-563c0ce9a58a/TJfkZi6Ck89M29kAplGP6sSsu3ldQ3IzUFka

## Fallback functionality
In order to create the fallback to work first we require to keep track of the health of the primary third party requests, given that one of the requirements is to log every provider's request I have decided to use the same database to calculate the rate based on a configurable range of time.

Every time valuations api is consumed it will retrieve the required data to calculate the failure rate, meaning that the DB will be hit to do this calculations and based on the number of request logged, and the calculated failure rate will be based on a real-time window frame. If the rate is calculated on based on the last hour requests, the rate will be different if we make a request at 1:00 pm than 1:01 pm, given that is calculated on every request.

For the purpose of this challenge I have decided to go with this approach given the constrains, however another approach that could reduce the cost of readings to the database and reduce the request time would be having a failure rate tracker which is trigger every given time, the results will be stored and accessible to the valuations api. The downside is that the failure rate will be the same within a range, since they are calculated once in a timeframe. Additionally, the fallback functionality could be less reactive as the failure rate is based on a specifi time, rather than a sliding window, therefore if the failure rate is calculated at 1:00pm (range 12:00pm to 12:59pm), the range is 1 hour but the super car valuations fails every request from 1:10 to 2:00pm the fallback service won't be used until the failure rate is calculated with the new data.

Both approaches have pros and cons, the best suited one for a project will be based in the different factors that impact the api and specific requirements on the behaviour with the cases presented.

## Additional notes
- The fallback time starts when the fallback is first triggered, not when the rate reaches 50% failure.
- The configuration include a minimum number of request to calculate the request success/failure rates
- The failure rate, time range to calculate request rates and the time to reset back the request to super car validation endpoint are configurable.
- VRM is can be correlated to log using `vrm` column on the provider_log table to keep it simple, no relation to valuations table since error request could log a request with an non-existing vrm.
- One of the features mentions returning a 503 Service Unavailable Error if both services are unavailable. I'm assuming if any of the providers return an error it will return a 503.
- Additional utils, axios and other configuration was added to improve resusability and easier to maintain.
- Test cases were added for new code, covering the base functionality of the api and the base configuration to facilitate the creation of tests. Due to time constrains the test were limited and some of the edge cases are not included.