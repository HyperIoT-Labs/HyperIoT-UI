import packageInfo from 'package.json';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  logLevel: 5,
  logRegistry: { },
  cookieSecure: false,
  mqttUrl: "tcp://broker-test.hyperiot.cloud",
  // stragatto url
  ccatUrl: "dashboard-test.hyperiot.cloud",
  // stragatto path
  ccatPath: "/hyperiot/llm",
  // stragatto security (ws or wss)
  ccatSecure: true,
  // stragatto port (NOT CHANGE)
  ccatPort: 0,
  // stragatto number of retries
  ccatRetries: 1,
  // stragatto retry conncetion delay
  ccatDelay: 2000,
  version: packageInfo.version,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
