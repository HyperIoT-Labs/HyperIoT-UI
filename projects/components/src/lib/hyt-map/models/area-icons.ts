import { Area } from 'core';
import { SelectOption } from '../../hyt-select/hyt-select.component';

export const AREA_ICONS_OPTIONS = new Map<Area.AreaViewTypeEnum, SelectOption[]>([
  [ 'IMAGE', [
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
    { label: 'Motion Sensor', value: 'door_sensor_fancy.png' },
    { label: 'Wind Sensor', value: 'door_sensor_fancy.png' },
    { label: 'Body Scanner', value: 'door_sensor_fancy.png' },
    { label: 'Door Sensor', value: 'door_sensor_fancy.png' },
    { label: 'GPS Sensor', value: 'door_sensor_fancy.png' },
    { label: 'Automated Light', value: 'door_sensor_fancy.png' },
    { label: 'Rain Sensor', value: 'door_sensor_fancy.png' },
    { label: 'RFID Sensor', value: 'door_sensor_fancy.png' },
    { label: 'Thermometer', value: 'door_sensor_fancy.png' },
  ]],
]);