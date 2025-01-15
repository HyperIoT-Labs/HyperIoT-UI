import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HPacketStore } from './hPackets.reducer';

export namespace HPacketSelectors {

  export const selectHPacketState = createFeatureSelector<HPacketStore.State>(HPacketStore.key);
    
  export const selectHPacketIds = createSelector(
    selectHPacketState,
    HPacketStore.selectHPacketIds // shorthand for usersState => HPacketStore.selectHPacketIds(usersState)
  );
  export const selectHPacketEntities = createSelector(
    selectHPacketState,
    HPacketStore.selectHPacketEntities
  );
  export const selectAllHPackets = createSelector(
    selectHPacketState,
    HPacketStore.selectAllHPackets
  );
  export const selectHPacketTotal = createSelector(
    selectHPacketState,
    HPacketStore.selectHPacketTotal
  );
  export const selectCurrentHPacketId = createSelector(
    selectHPacketState,
    HPacketStore.getSelectedHPacketId
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
    
}
