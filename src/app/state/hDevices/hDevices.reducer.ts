import { createReducer, on, Store } from "@ngrx/store";
import { HDevice, Logger, LoggerService } from "core";
import { environment } from "src/environments/environment";
import { HDeviceActions } from "./hDevices.actions";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('HDevicesReducer');

export interface State extends EntityState<HDevice> {
  // additional entities state properties
  selectedHDeviceId: string | null;
}

export const adapter: EntityAdapter<HDevice> = createEntityAdapter<HDevice>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  selectedHDeviceId: null,
});

export const reducer = createReducer(
  initialState,
  on(HDeviceActions.loadHDevices, (state) => {
    return { ...state };
  }),
  on(HDeviceActions.loadHDevicesSuccess, (state, { hDevices }) => {
    return adapter.setAll(hDevices, state);
  }),
  on(HDeviceActions.loadHDevicesFailure, (state, { error }) => {
    return { ...state };
  }),
  on(HDeviceActions.addHDevice, (state, { hDevice }) => {
    return adapter.addOne(hDevice, state)
  }),
  on(HDeviceActions.setHDevice, (state, { hDevice }) => {
    return adapter.setOne(hDevice, state)
  }),
  on(HDeviceActions.upsertHDevice, (state, { hDevice }) => {
    return adapter.upsertOne(hDevice, state);
  }),
  on(HDeviceActions.addHDevices, (state, { hDevices }) => {
    return adapter.addMany(hDevices, state);
  }),
  on(HDeviceActions.upsertHDevices, (state, { hDevices }) => {
    return adapter.upsertMany(hDevices, state);
  }),
  on(HDeviceActions.updateHDevice, (state, { update }) => {
    return adapter.updateOne(update, state);
  }),
  on(HDeviceActions.updateHDevices, (state, { updates }) => {
    return adapter.updateMany(updates, state);
  }),
  on(HDeviceActions.mapHDevice, (state, { entityMap }) => {
    return adapter.mapOne(entityMap, state);
  }),
  on(HDeviceActions.mapHDevices, (state, { entityMap }) => {
    return adapter.map(entityMap, state);
  }),
  on(HDeviceActions.deleteHDevice, (state, { id }) => {
    return adapter.removeOne(id, state);
  }),
  on(HDeviceActions.deleteHDevices, (state, { ids }) => {
    return adapter.removeMany(ids, state);
  }),
  on(HDeviceActions.deleteHDevicesByPredicate, (state, { predicate }) => {
    return adapter.removeMany(predicate, state);
  }),
  on(HDeviceActions.setHDevices, (state, { hDevices }) => {
    return adapter.setMany(hDevices, state);
  }),
  on(HDeviceActions.clearHDevices, state => {
    return adapter.removeAll({ ...state, selectedHDeviceId: null });
  })
);

export const getSelectedHDeviceId = (state: State) => state.selectedHDeviceId;

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of liveAlarm ids
export const selectHDeviceIds = selectIds;

// select the dictionary of liveAlarm entities
export const selectHDeviceEntities = selectEntities;

// select the array of liveAlarms
export const selectAllHDevices = selectAll;

// select the total liveAlarm count
export const selectHDeviceTotal = selectTotal;

export const hDeviceReducerKey = 'hDevices';