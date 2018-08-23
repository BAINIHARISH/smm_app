<!---
  HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
  
  (c) 2016-2018 Hortonworks, Inc. All rights reserved.
  
  This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
  of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
  authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
  an authorized and properly licensed third party, you do not have any rights to this code.
  
  If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
  WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
  RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
  AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
  OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
  TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
  DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
  OR LOSS OR CORRUPTION OF DATA.
-->
# Streams Messaging Manager UI

### Build instructions

* Clone the repository from github with git clone https://github.com/hortonworks/streams-messaging-manager-ui
* Go to the root directory of the cloned repository and run `npm install`

### Running Dev Server

* Run `npm start` to start UI application

SMM server host info can be changed in `dev-clusters/services_smm.json` file
```
[{
  "id": 1,
  ...
  "hosts": ["localhost"],  // hostname of smm server
  ...
  "properties": [{ ...
    "type": "streams-messaging-manager-ssl-config",
    "properties": {
      ...
      "streams_messaging_manager.ssl.isenabled": "false", // enable/disable ssl
      ...
    }
  },{ ...
    "type": "streams-messaging-manager-common",
    "properties": {
      ...
      "port": "8585", // port is used when ssl is not enabled
      "streams_messaging_manager.ssl.port": "8587" // port is used when ssl is enabled
      ...
    }
  },
  ...
  ],
}]
```

### Contributing

If you wish to make contributions to this project, refer to [CONTRIBUTING.md](https://github.com/hortonworks/dps_platform/blob/master/CONTRIBUTING.md) to DPS for more information.

### License

The DPS Platform and it's associated DPS applications are made available under the terms
of the [GNU Affero General Public License (GNU AGPLv3)](COPYING).
