import { createSelector } from '@ngrx/store';
import { HPacket } from 'core';

export interface HPacketsState {
  hPackets: HPacket[];
}
 
const selectHPackets = (state: HPacketsState) => state.hPackets;
 
const selectHPacketById = (id: number) => createSelector(
  selectHPackets,
  (state: HPacket[]) => state.find(x => x.id === id),
);

export const HPacketsSelectors = {
  selectHPackets,
  selectHPacketById,
}