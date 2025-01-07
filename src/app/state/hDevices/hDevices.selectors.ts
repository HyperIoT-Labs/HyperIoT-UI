import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromHDevice from './hDevices.reducer'
import { RuleSelectors } from '../rules/rules.selectors';
import { HPacketSelectors } from '../hPackets/hPackets.selectors';
import { HDevice } from 'core';

export const selectHDeviceState = createFeatureSelector<fromHDevice.State>(fromHDevice.hDeviceReducerKey);
  
export const selectHDeviceIds = createSelector(
  selectHDeviceState,
  fromHDevice.selectHDeviceIds // shorthand for usersState => fromHDevice.selectHDeviceIds(usersState)
);
export const selectHDeviceEntities = createSelector(
  selectHDeviceState,
  fromHDevice.selectHDeviceEntities
);
export const selectAllHDevices = createSelector(
  selectHDeviceState,
  fromHDevice.selectAllHDevices
);
export const selectHDeviceTotal = createSelector(
  selectHDeviceState,
  fromHDevice.selectHDeviceTotal
);
export const selectCurrentHDeviceId = createSelector(
  selectHDeviceState,
  fromHDevice.getSelectedHDeviceId
);

export const selectCurrentHDevice = createSelector(
  selectHDeviceEntities,
  selectCurrentHDeviceId,
  (alarmEnetities, userId) => userId && alarmEnetities[userId]
);

export const selectHDeviceById = (props: { id: number }) => createSelector(
  selectHDeviceEntities,
  (hDeviceEnetities) => props.id && hDeviceEnetities[props.id]
);

export const selectHDevcicesByRuleId = (props: { ruleId: number }) => createSelector(
  RuleSelectors.selectRuleEntities,
  HPacketSelectors.selectHPacketEntities,
  selectHDeviceEntities,
  (rules, packets, devicesEntities) => {
    const ruleDefinition = rules[props.ruleId].ruleDefinition.replace(/"/g, '').trim();
    const ruleArray: string[] = ruleDefinition.match(/[^AND|OR]+(AND|OR)?/g).map(x => x.trim());

    const devices: HDevice[] = [];
    ruleArray.forEach(rule => {
      const tempSplitted: string[] = rule.split(' ').filter(i => i);
      const packetFieldPart = tempSplitted.shift();
      const splitted: string[] = packetFieldPart.split('.').concat(tempSplitted);
      const packetId = +splitted[0];

      const deviceByPacketId = devicesEntities[packets[packetId].device.id];

      devices.push(deviceByPacketId);
    });
    return devices;
  }
);

export const HDeviceSelectors = {
  selectHDeviceState,
  selectHDeviceIds,
  selectHDeviceEntities,
  selectAllHDevices,
  selectHDeviceTotal,
  selectCurrentHDeviceId,
  selectCurrentHDevice,
  selectHDevcicesByRuleId
}