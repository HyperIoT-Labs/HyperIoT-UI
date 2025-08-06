import { createFeatureSelector, createSelector } from '@ngrx/store';

import { HDeviceStore } from './hDevices.reducer'
import { HDevice } from '../../hyperiot-client/hyt-api/api-module';
import { RuleSelectors } from '../rules/rules.selectors';
import { HPacketSelectors } from '../hPackets/hPackets.selectors';

export namespace HDeviceSelectors {

  export const selectHDeviceState = createFeatureSelector<HDeviceStore.State>(HDeviceStore.key);

  export const selectHDeviceIds = createSelector(
    selectHDeviceState,
    HDeviceStore.selectHDeviceIds // shorthand for usersState => HDeviceStore.selectHDeviceIds(usersState)
  );
  export const selectHDeviceEntities = createSelector(
    selectHDeviceState,
    HDeviceStore.selectHDeviceEntities
  );
  export const selectAllHDevices = createSelector(
    selectHDeviceState,
    HDeviceStore.selectAllHDevices
  );
  export const selectHDeviceTotal = createSelector(
    selectHDeviceState,
    HDeviceStore.selectHDeviceTotal
  );
  export const selectCurrentHDeviceId = createSelector(
    selectHDeviceState,
    HDeviceStore.getSelectedHDeviceId
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

}
