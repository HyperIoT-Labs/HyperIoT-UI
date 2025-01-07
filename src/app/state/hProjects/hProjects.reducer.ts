import { createReducer, on, Store } from "@ngrx/store";
import { HProject, Logger, LoggerService } from "core";
import { environment } from "src/environments/environment";
import { HProjectActions } from "./hProjects.actions";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('HProjectsReducer');

export interface State extends EntityState<HProject> {
  // additional entities state properties
  selectedHProjectId: string | null;
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
    return adapter.setAll(hProjects, state);
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

export const hProjectsReducerKey = 'hProjects';