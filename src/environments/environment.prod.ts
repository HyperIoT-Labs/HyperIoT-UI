import packageInfo from 'package.json';

export const environment = {
  production: true,
  logLevel: 1,
  logRegistry: { },
  cookieSecure: false,
  mqttUrl: "tcp://broker.hyperiot.cloud",
  ccatUrl: "dashboard.hyperiot.cloud",
  version: packageInfo.version,
};
