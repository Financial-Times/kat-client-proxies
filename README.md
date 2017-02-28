# kat-client-proxies
A library of client proxies for various apis

## Current proxies
* myFTClient
* acquisitionCtxClient

## Environment variables
Runtime environment variables can be found in lib/config.js
```
MYFT_API_URL
MYFT_API_KEY
ACS_API_URL
ACS_API_KEY
USER_PROFILE_API_URL
USER_PROFILE_API_KEY
ALS_API_URL
ALS_API_KEY
FT_TOOL_ID
FT_TOOL_ADMIN_ID
FT_TOOL_DATE_ID
```
Test cases can also be configured via environment variables as per test/env.js

## Testing
`npm test` will by default use the mocked APIs and associated fixtures. It is possible to test against the actual APIs by setting the following environment variables:
```
USE_MOCK_API=false
USER_UUID=
LICENCE_UUID=
```
Where `USER_UUID` is a valid user uuid on FT.com and `LICENCE_UUID` is the uuid of the licence associated with `USER_UUID`
