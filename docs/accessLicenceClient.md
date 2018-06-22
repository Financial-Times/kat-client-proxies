# Access Licence Service
-----
## `getLicences(query)`

Gets the licence/licences for a certain query

**Parameters**

**query**: `Object`, where the sole key is one of the following: `adminuserid | linkid | linktype | status | userid`

e.g `{ userid: '00000000-0000-0000-0000-000000000003' }` to find the licences that user belongs to.


**Returns**

**`Promise<Array>`**, an array of information about the licences found

Example response:
```js
[
	{
		"id": "00000000-0000-0000-0000-000000000001",
		"creationDateTime": "2015-11-30T14:53:32.795Z",
		"products": [
			{
				"code": "P2",
				"name": "FT.com Premium"
			}
		],
		"issueReason": "Complimentary Access",
		"links": [
			{
				"rel": "complimentary",
				"href": "https://test.com/1234567890",
				"id": "CA-12345678"
			}
		],
		"status": "active",
		"seatLimit": 99999,
		"ipAccessEnabled": false,
		"ipAccessAddresses": [],
		"lastUpdatedDateTime": "2017-02-27T16:21:22.296Z",
		"href": "/licences/00000000-0000-0000-0000-000000000001",
		"seatsHref": [
			{
				"rel": "seats",
				"href": "/licences/00000000-0000-0000-0000-000000000001/seats"
			}
		],
		"adminsHref": [
			{
				"rel": "administrators",
				"href": "/licences/00000000-0000-0000-0000-000000000001/administrators"
			}
		]
	}
	]
```

--------

## `getSeats(licenceID)`

Gets the uuid of users from a licence

**Parameters**

**licenceID**: `String`, a licence’s uuid

**Returns**

**`Promise<Array>`**, an array seats on the licence

Example response:
```js
[
	{
		"accessLicenceId": "00000000-0000-0000-0000-000000000001",
		"userId": "00000000-0000-0000-0000-000000002222",
		"joinedDate": "2016-09-02T10:41:20.374Z",
		"seatExpiryDate": null
	},
	...
]
```

------

## `getLicenceInfo(licenceId)`

Gets some information about a given licence.

**Parameters**

**licenceID**: `String`, a licence’s uuid

**Returns**

**`Promise<Oject>`**, information about a licence

Example response:
```js
{
	"id": "00000000-0000-0000-0000-000000000001",
	"creationDateTime": "2015-09-24T13:34:55.073Z",
	"products": [
		{
			"code": "P2",
			"name": "FT.com Premium"
		}
	],
	"issueReason": "Contract Signed",
	"links": [
		{
			"rel": "contract",
			"href": "#",
			"id": "FT-123"
		}
	],
	"status": "active",
	"seatLimit": 20,
	"ipAccessEnabled": false,
	"ipAccessAddresses": [],
	"lastUpdatedDateTime": "2017-05-03T14:01:37.649Z",
	"seatsHref": [
		{
			"rel": "seats",
			"href": "/licences/00000000-0000-0000-0000-000000000001/seats"
		}
	],
	"adminsHref": [
		{
			"rel": "administrators",
			"href": "/licences/00000000-0000-0000-0000-000000000001/administrators"
		}
	],
	"href": "/licences/00000000-0000-0000-0000-000000000001"
}
```

--------

## `getAdministrators(licenceId)`

Gets the licence administrators

**Parameters**

**licenceID**: `String`, a licence’s uuid

**Returns**

**`Promise<Array>`**, a licence’s administrators

Example response:
```js
[
	{
		"accessLicenceId": "00000000-0000-0000-0000-000000000001",
		"userId": "00000000-0000-0000-0000-000000000003",
		"joinedDate": "2015-11-26T10:42:58.062Z"
	},
	...
]
```
