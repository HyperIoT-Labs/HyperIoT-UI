import packageInfo from 'package.json';

export const environment = {
  production: true,
  logLevel: 1,
  logRegistry: { },
  cookieSecure: false,
  mqttUrl: "tcp://broker.hyperiot.cloud",
  // cheshire-cat-ai url
  ccatUrl: "dashboard.hyperiot.cloud",
  // cheshire-cat-ai path
  ccatPath: "/hyperiot/llm",
  // cheshire-cat-ai security (ws or wss)
  ccatSecure: true,
  // cheshire-cat-ai port (NOT CHANGE)
  ccatPort: 0,
  // cheshire-cat-ai number of retries
  ccatRetries: 1,
  // cheshire-cat-ai retry conncetion delay
  ccatDelay: 2000,
  version: packageInfo.version,
};
