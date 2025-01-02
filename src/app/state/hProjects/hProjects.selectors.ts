import { createSelector } from '@ngrx/store';
import { HProject } from 'core';

export interface HProjectsState {
  hProjects: HProject[];
}
 
const selectHProjects = (state: HProjectsState) => state.hProjects;
 
const selectHProjectById = (id: number) => createSelector(
  selectHProjects,
  (state: HProject[]) => state.find(x => x.id === id),
);

export const HProjectsSelectors = {
  selectHProjects,
  selectHProjectById,
}