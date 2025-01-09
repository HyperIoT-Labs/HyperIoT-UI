import { createFeatureSelector, createSelector } from '@ngrx/store';

import { HProjectStore } from './hProjects.reducer';

export namespace HProjectSelectors {
  export const selectHProjectState = createFeatureSelector<HProjectStore.State>(HProjectStore.key);
  
  export const selectHProjectIds = createSelector(
    selectHProjectState,
    HProjectStore.selectHProjectIds // shorthand for usersState => HProjectStore.selectHProjectIds(usersState)
  );
  export const selectHProjectEntities = createSelector(
    selectHProjectState,
    HProjectStore.selectHProjectEntities
  );
  export const selectAllHProjects = createSelector(
    selectHProjectState,
    HProjectStore.selectAllHProjects
  );
  export const selectHProjectTotal = createSelector(
    selectHProjectState,
    HProjectStore.selectHProjectTotal
  );
  export const selectCurrentHProjectId = createSelector(
    selectHProjectState,
    HProjectStore.getSelectedHProjectId
  );
  
  export const selectCurrentHProject = createSelector(
    selectHProjectEntities,
    selectCurrentHProjectId,
    (alarmEnetities, userId) => userId && alarmEnetities[userId]
  );
  
  export const selectHProjectById = (props: {id: number}) => createSelector(
    selectHProjectEntities,
    (hProjectEnetities) => props.id && hProjectEnetities[props.id]
  );
}
