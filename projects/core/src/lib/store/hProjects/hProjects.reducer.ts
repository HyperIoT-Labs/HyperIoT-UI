import { createReducer, on } from "@ngrx/store";
import { HProject } from "../../hyperiot-client/models/hProject";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { HProjectActions } from "./hProjects.actions";

export namespace HProjectStore {

  export const key = 'hProjects';

  export interface State extends EntityState<HProject> {
    // additional entities state properties
    selectedHProjectId: number | null;
  }

  export const adapter: EntityAdapter<HProject> = createEntityAdapter<HProject>();

  export const initialState: State = adapter.getInitialState({
    // additional entity state properties
    selectedHProjectId: null,
  });

  export const reducer = createReducer(
    initialState,
    on(HProjectActions.loadHProjects, (state) => {
      return { ...state };
    }),
    on(HProjectActions.loadHProjectsSuccess, (state, { hProjects }) => {
      return adapter.setAll(hProjects, {
        ...state,
        selectedHProjectId: null
      });
    }),
    on(HProjectActions.loadHProjectsFailure, (state, { error }) => {
      return { ...state };
    }),
    on(HProjectActions.addHProject, (state, { hProject }) => {
      return adapter.addOne(hProject, state)
    }),
    on(HProjectActions.setHProject, (state, { hProject }) => {
      return adapter.setOne(hProject, state)
    }),
    on(HProjectActions.upsertHProject, (state, { hProject }) => {
      return adapter.upsertOne(hProject, state);
    }),
    on(HProjectActions.addHProjects, (state, { hProjects }) => {
      return adapter.addMany(hProjects, state);
    }),
    on(HProjectActions.upsertHProjects, (state, { hProjects }) => {
      return adapter.upsertMany(hProjects, state);
    }),
    on(HProjectActions.updateHProject, (state, { update }) => {
      return adapter.updateOne(update, state);
    }),
    on(HProjectActions.updateHProjects, (state, { updates }) => {
      return adapter.updateMany(updates, state);
    }),
    on(HProjectActions.mapHProject, (state, { entityMap }) => {
      return adapter.mapOne(entityMap, state);
    }),
    on(HProjectActions.mapHProjects, (state, { entityMap }) => {
      return adapter.map(entityMap, state);
    }),
    on(HProjectActions.deleteHProject, (state, { id }) => {
      return adapter.removeOne(id, state);
    }),
    on(HProjectActions.deleteHProjects, (state, { ids }) => {
      return adapter.removeMany(ids, state);
    }),
    on(HProjectActions.deleteHProjectsByPredicate, (state, { predicate }) => {
      return adapter.removeMany(predicate, state);
    }),
    on(HProjectActions.setHProjects, (state, { hProjects }) => {
      return adapter.setMany(hProjects, state);
    }),
    on(HProjectActions.setSelectedHProjectId, (state, { id }) => {
      return {
        ...state,
        selectedHProjectId: id
      };
    }),
    on(HProjectActions.clearHProjects, state => {
      return adapter.removeAll({ ...state, selectedHProjectId: null });
    })
  );

  export const getSelectedHProjectId = (state: State) => state.selectedHProjectId;

  // get the selectors
  const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
  } = adapter.getSelectors();

  // select the array of liveAlarm ids
  export const selectHProjectIds = selectIds;

  // select the dictionary of liveAlarm entities
  export const selectHProjectEntities = selectEntities;

  // select the array of liveAlarms
  export const selectAllHProjects = selectAll;

  // select the total liveAlarm count
  export const selectHProjectTotal = selectTotal;

}
