# Description - Internal Use

Mocky is a little different to a lot of mock/stub services as to manage the mocks, it uses data from your local browser storage. This means, only one person can update the mocks. If there is a problem with any of the stubs that were created in Mocky or you need to update them, then you can follow these simple steps:

- Locate the files for these stubs in the repository INSERT LINK
- Go to https://designer.mocky.io/ and select New Mock
- For Supercar Valuations, choose the following:
    - Leave the response as 200 OK
    - Ensure Response Content Type is “application/json”
    - Paste the contents of `supercar-valuations-stub-response.json` into the HTTP Response Body field
    - Provide a useful identifier to help you manage the mocks in the future.
    - Make a note of the Uri of the Mock.
    - Update the base Uri of the axios client in the `src/super-car/super-car-valuation-service-client.ts` file
    - Update the server URL in the swagger spec in the `third-party-api/SuperCar/supercar-valuations-0.1-swagger.yaml` file
    - Update the link to the stub in the ReadMe file (under Super Car Valuations header)
- For Premium Car Valuations, choose the following:
    - Leave the response as 200 OK
    - Ensure Response Content Type is “application/xml”
    - Paste the contents of `premium-car-valuations-stub-response.xml` into the HTTP Response Body field
    - Provide a useful identifier to help you manage the mocks in the future.
    - Make a note of the Uri of the Mock.
    - Update the server URL in the swagger spec in the `third-party-api/Premium Car/premium-car-valuations-0.1-swagger.yaml` file
    - Update the link to the stub in the ReadMe file (under Premium Car Valuations header)