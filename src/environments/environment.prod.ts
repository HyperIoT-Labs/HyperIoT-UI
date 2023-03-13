import packageInfo from 'package.json';

export const environment = {
  production: true,
  cookieSecure: false,
  mqttUrl: "tcp://karaf-activemq-mqtt-test.hyperiot.cloud",
  version: packageInfo.version,
};
