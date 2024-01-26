import packageInfo from 'package.json';

export const environment = {
  production: true,
  logLevel: 1,
  logRegistry: { },
  cookieSecure: false,
  mqttUrl: "tcp://broker.hyperiot.cloud",
  ccatUrl: "localhost",
  ccatPort: 1865,
  version: packageInfo.version,
};
