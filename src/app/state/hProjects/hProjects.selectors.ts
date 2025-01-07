import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromHProject from './hProjects.reducer'

export const selectHProjectState = createFeatureSelector<fromHProject.State>(fromHProject.hProjectsReducerKey);
  
export const selectHProjectIds = createSelector(
  selectHProjectState,
  fromHProject.selectHProjectIds // shorthand for usersState => fromHProject.selectHProjectIds(usersState)
);
export const selectHProjectEntities = createSelector(
  selectHProjectState,
  fromHProject.selectHProjectEntities
);
export const selectAllHProjects = createSelector(
  selectHProjectState,
  fromHProject.selectAllHProjects
);
export const selectHProjectTotal = createSelector(
  selectHProjectState,
  fromHProject.selectHProjectTotal
);
export const selectCurrentHProjectId = createSelector(
  selectHProjectState,
  fromHProject.getSelectedHProjectId
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

export const HProjectSelectors = {
  selectHProjectState,
  selectHProjectIds,
  selectHProjectEntities,
  selectAllHProjects,
  selectHProjectTotal,
  selectCurrentHProjectId,
  selectCurrentHProject,
}