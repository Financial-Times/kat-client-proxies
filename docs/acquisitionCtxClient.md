# Acquisition Context Client
-----
## getContexts(ctxFilter)

Gets a list of acquisition contents based a filter

**Parameters**

**ctxFilter**: `Object`, an object where the sole key is one of the following: `access-licence-id | email-domain | ip-address`

**Returns**

**`Promise<Array|Object>`**, the licence’s acquisition context or an array of them based on the filter (more details can be found [here](https://developer.ft.com/portal/docs-membership-platform-api-acquisition-context-acquisition-context-resource))

Example response:
```js
{
	"AcquisitionContext": {
		"signupContext": {
			"accessLicenceId": "00000000-0000-0000-0000-000000000001",
			"allowedEmailDomains": [],
			"restrictEmailDomains": false,
			"blockedEmailDomains": [],
			"restrictBlockedEmailDomains": false,
			"signupWelcomeText": null
		},
		"barrierContext": {
			"promptUserToJoin": false,
			"subHeading": null,
			"bodyText": null,
			"redirectUrl": null,
			"displaySignupUrl": false
		},
		"id": "00000000-0000-0000-0000-000000000333",
		"name": "KAT Context name",
		"allowedIPRanges": [],
		"restrictIPRanges": false,
		"displayName": "KAT Context displayName",
		"logoUrl": null,
		"marketable": true,
		"lastUpdated": "2016-09-02T11:15:35.496Z"
	}
}
```
