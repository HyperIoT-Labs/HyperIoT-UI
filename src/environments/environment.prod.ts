import packageInfo from 'package.json';

export const environment = {
  production: true,
  logLevel: 1,
  logRegistry: { },
  cookieSecure: false,
  mqttUrl: "tcp://karaf-activemq-mqtt-test.hyperiot.cloud",
  version: packageInfo.version,
};
