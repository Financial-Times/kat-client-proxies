# kat-client-proxies
A library of client proxies for various apis

## Current proxies
* myFTClient
* acquisitionCtxClient

## Environment variables
The following variables are used by the clients:
```
MYFT_API_KEY
MYFT_API_URL
ACS_API_URL
ACS_API_KEY
```

## Testing
`npm test` will by default use the mocked APIs and associated fixtures. It is possible to test against the actual APIs by setting the following environment variables:
```
USE_MOCK_API=false
USER_UUID=
LICENCE_UUID=
```
Where `USER_UUID` is a valid user uuid on FT.com and `LICENCE_UUID` is the uuid of the licence associated with `USER_UUID`
