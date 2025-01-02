import { createSelector } from '@ngrx/store';
import { HDevice } from 'core';

export interface HDevicesState {
  hDevices: HDevice[];
}
 
const selectHDevices = (state: HDevicesState) => state.hDevices;
 
const selectHDeviceById = (id: number) => createSelector(
  selectHDevices,
  (state: HDevice[]) => state.find(x => x.id === id),
);

const selectHDeviceByPacketId = (packetId: number) => createSelector(
  selectHDevices,
  (state: HDevice[]) => state.find(x => x.packets.some(y => y.id === packetId)),
);

export const HDevicesSelectors = {
  selectHDevices,
  selectHDeviceById,
  selectHDeviceByPacketId,
}