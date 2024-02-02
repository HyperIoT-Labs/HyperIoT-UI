import packageInfo from 'package.json';

export const environment = {
  production: true,
  logLevel: 1,
  logRegistry: { },
  cookieSecure: false,
  mqttUrl: "tcp://broker.hyperiot.cloud",
  // stragatto url
  ccatUrl: "dashboard.hyperiot.cloud",
  // stragatto path
  ccatPath: "/hyperiot/llm",
  // stragatto security (ws or wss)
  ccatSecure: false,
  // stragatto port (NOT CHANGE)
  ccatPort: 0,
  // stragatto number of retries
  ccatRetries: 1,
  // stragatto retry conncetion delay
  ccatDelay: 2000,
  version: packageInfo.version,
};
