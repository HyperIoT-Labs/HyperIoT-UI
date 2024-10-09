import { Area } from 'core';
import { SelectOption } from '../../hyt-select/hyt-select.component';

export const AREA_ICONS_OPTIONS = new Map<Area.AreaViewTypeEnum, SelectOption[]>([
  [ 'IMAGE', [
    { label: 'Default Sensor', value: 'generic_sensor_transparent.png' },
    { label: 'Motion Sensor', value: 'motion-sensor.png' },
    { label: 'Wind Sensor', value: 'wind-sensor.png' },
    { label: 'Body Scanner', value: 'body-scanner.png' },
    { label: 'Door Sensor', value: 'door-sensor.png' },
    { label: 'GPS Sensor', value: 'gps-sensor.png' },
    { label: 'Automated Light', value: 'light.png' },
    { label: 'Rain Sensor', value: 'rain-sensor.png' },
    { label: 'RFID Sensor', value: 'rfid.png' },
    { label: 'Thermometer', value: 'thermometer.png' },
  ]],
  [ 'MAP', [
    { label: 'Default Sensor', value: 'generic_sensor_gradient.png' },
    { label: 'Motion Sensor', value: 'motion_sensor_radial.png' },
    { label: 'Wind Sensor', value: 'wind_sensor_gradient.png' },
    { label: 'Body Scanner', value: 'body_scan_radial.png' },
    { label: 'Door Sensor', value: 'door_sensor_radial.png' },
    { label: 'GPS Sensor', value: 'gps_radial.png' },
    { label: 'Automated Light', value: 'automated_light_radial.png' },
    { label: 'Rain Sensor', value: 'rain_sensor_radial.png' },
    { label: 'RFID Sensor', value: 'rfid_gradient.png' },
    { label: 'Thermometer', value: 'temperature_sensor_radial.png' },
  ]],
]);