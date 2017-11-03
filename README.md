# kat-client-proxies
A library of client proxies for use with various APIs used by KAT.

KAT (Knowledge & administration tools) is an ft.com application created for Financial Times B2B clients.

## Getting started


`$ git clone git@github.com:Financial-Times/kat-client-proxies.git`

Standard next app `make` tasks apply:

`make intall`
`make .env`
`make test`

Whenever you are adding a new client proxies, for maintenance don't forget to include it in the list in the end of this README.

## Testing
`$ npm test` will by default use the mocked APIs and associated fixtures. In some cases it is possible to test against the actual APIs by setting the following environment variables:

```
USE_MOCK_API=false
USER_UUID=
LICENCE_UUID=
```

Where `USER_UUID` is a valid user uuid on FT.com and `LICENCE_UUID` is the uuid of the licence associated with `USER_UUID`. Feel free to approach KAT team via `#ft-syndikat` slack channel if you have any questions.

## Deployment
This module has been created to be included throughout other KAT components.

### How to update a repo that uses the module to the new version
If you want to update connected components with the latest version, you need to follow the following steps:
1. Create a new repository release on GitHub. Please follow naming convention of previous releases.
2. Go to `package.json` file of the component you want to update, and change `"kat-client-proxies"` dependency version to the [newly released one](https://github.com/Financial-Times/kat-client-proxies/releases).

The following KAT components are currently using `kat-client-proxies`:
- [kat-overview](https://github.com/Financial-Times/kat-overview)
- [kat-myft](https://github.com/Financial-Times/kat-myft)
- [kat-usage-report](https://github.com/Financial-Times/kat-usage-report)
- [kat-myft-syncher] (https://github.com/Financial-Times/kat-myft-syncher)
- [kat-api] (https://github.com/Financial-Times/kat-api)
- [kmt-utilities] (https://github.com/Financial-Times/kmt-utilities)

### How to use the module

#### Installation guide

Include `"kat-client-proxies": "financial-times/kat-client-proxies#v[LATEST_RELEASE_VERSION]"` as a dependency in your package.json. [Information about the latest version](https://github.com/Financial-Times/kat-client-proxies/releases).

#### Usage

In your application wherever you would like to use kat-client-proxies include the path to the code you want to use:

```js
//... your app code
const [moduleName] = require('kat-client-proxies').[moduleName];
// ... and then e.g.
[moduleName].[functionName]([args...])
```

## Current proxies
* accessLicenceClient
* acquisitionCtxClient
* clientErrors
* elasticSearchClient
* emailNotification
* facetsClient
* huiClient
* kinesisClient
* licenceDataClient
* myFTClient
* sessionClient
* syncUserFollows
* userProfileClient
