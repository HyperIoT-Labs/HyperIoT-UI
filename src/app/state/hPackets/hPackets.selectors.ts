import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromHPacket from './hPackets.reducer'

export const selectHPacketState = createFeatureSelector<fromHPacket.State>(fromHPacket.hPacketReducerKey);
  
export const selectHPacketIds = createSelector(
  selectHPacketState,
  fromHPacket.selectHPacketIds // shorthand for usersState => fromHPacket.selectHPacketIds(usersState)
);
export const selectHPacketEntities = createSelector(
  selectHPacketState,
  fromHPacket.selectHPacketEntities
);
export const selectAllHPackets = createSelector(
  selectHPacketState,
  fromHPacket.selectAllHPackets
);
export const selectHPacketTotal = createSelector(
  selectHPacketState,
  fromHPacket.selectHPacketTotal
);
export const selectCurrentHPacketId = createSelector(
  selectHPacketState,
  fromHPacket.getSelectedHPacketId
);

export const selectCurrentHPacket = createSelector(
  selectHPacketEntities,
  selectCurrentHPacketId,
  (alarmEnetities, userId) => userId && alarmEnetities[userId]
);

export const selectHPacketById = (props: {id: number}) => createSelector(
  selectHPacketEntities,
  (hPacketEnetities) => props.id && hPacketEnetities[props.id]
);

export const HPacketSelectors = {
  selectHPacketState,
  selectHPacketIds,
  selectHPacketEntities,
  selectAllHPackets,
  selectHPacketTotal,
  selectCurrentHPacketId,
  selectCurrentHPacket,
}