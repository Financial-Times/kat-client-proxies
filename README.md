# kat-client-proxies
A library of helper client proxies for use with various APIs used by KAT.

KAT (Knowledge & administration tools) is an ft.com application created for Financial Times B2B clients.

**NOTE:** This component currently is configured to use Node 6 APIs and cannot be updated unless any consuming Lambdas are using >v6

## Getting started

Standard next app `make` tasks apply:

```
$ git clone git@github.com:Financial-Times/kat-client-proxies.git
$ cd kat-client-proxies
$ make install
$ make .env
```

Whenever you are adding a new client proxies, for maintenance don't forget to include it in the list in the end of this README.

### Tests

Tests are run using
```
$ make test
```

Tests will, by default, mock APIs and associated fixtures. It is possible to test against the live APIs by setting the following environment variables:

```
export USE_MOCK_API=false
export USER_UUID=<see-below>
export LICENCE_UUID=<see-below>
```
Where `USER_UUID` is a valid user uuid on FT.com and `LICENCE_UUID` is the uuid of the licence associated with `USER_UUID`. Feel free to approach KAT team via `#ft-syndikat` slack channel if you have any questions.

## Deployment
This module has been created to be included throughout other KAT components.

Releases of `kat-client-proxies` are made by creating a tagged release of the component following semver. This should trigger a tagged CI build which will deploy as an npm package.

The following KAT apps and components are currently using `kat-client-proxies`:
- [kat-overview](https://github.com/Financial-Times/kat-overview)
- [kat-users](https://github.com/Financial-Times/kat-users)
- [kat-groups](https://github.com/Financial-Times/kat-groups)
- [kat-myft](https://github.com/Financial-Times/kat-myft)
- [kat-usage](https://github.com/Financial-Times/kat-usage)
- [kat-myft-syncher](https://github.com/Financial-Times/kat-myft-syncher)
- [kat-api](https://github.com/Financial-Times/kat-api)
- [kmt-utilities](https://github.com/Financial-Times/kmt-utilities)

## Usage

### Installation guide

`kat-client-proxies` is available as an npm module and can be installed using
```
$ npm install --save @financial-times/kat-client-proxies
```

### API

#### `accessLicenceClient`
```js
const { accessLicenceClient } = require('@financial-times/kat-client-proxies');
```

Docs can be found [here](./docs/accessLicenceClient.md)

#### `acquisitionCtxClient`
```js
const { acquisitionCtxClient } = require('@financial-times/kat-client-proxies');
```

Docs can be found [here](./docs/acquisitionCtxClient.md)

#### `clientErrors`
```js
const { clientErrors } = require('@financial-times/kat-client-proxies');
```

Docs can be found [here](./docs/clientErrors.md)

#### `elasticSearchClient`
```js
const { elasticSearchClient } = require('@financial-times/kat-client-proxies');
```

Docs can be found [here](./docs/elasticSearchClient.md)

#### `emailNotification`
```js
const { emailNotification } = require('@financial-times/kat-client-proxies');
```

🚧👷‍♀️👷🚧

#### `facetsClient`
```js
const { facetsClient } = require('@financial-times/kat-client-proxies');
```

Docs can be found [here](./docs/facetsClient.md)

#### `kinesisClient`
```js
const { kinesisClient } = require('@financial-times/kat-client-proxies');
```

🚧👷‍♀️👷🚧

#### `licenceDataClient`
```js
const { licenceDataClient } = require('@financial-times/kat-client-proxies');
```

🚧👷‍♀️👷🚧

#### `myFTClient`
```js
const { myFTClient } = require('@financial-times/kat-client-proxies');
```

🚧👷‍♀️👷🚧

#### `sessionClient`
```js
const { sessionClient } = require('@financial-times/kat-client-proxies');
```

🚧👷‍♀️👷🚧

#### `syncUserFollows`
```js
const { syncUserFollows } = require('@financial-times/kat-client-proxies');
```

🚧👷‍♀️👷🚧

#### `userProfileClient`
```js
const { userProfileClient } = require('@financial-times/kat-client-proxies');
```

🚧👷‍♀️👷🚧
