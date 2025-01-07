import { createReducer, on, Store } from "@ngrx/store";
import { HPacket, Logger, LoggerService } from "core";
import { environment } from "src/environments/environment";
import { HPacketActions } from "./hPackets.actions";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";

const logger = new Logger(new LoggerService(environment.logLevel, environment.logRegistry));
logger.registerClass('HPacketsReducer');

export interface State extends EntityState<HPacket> {
  // additional entities state properties
  selectedHPacketId: string | null;
}

export const adapter: EntityAdapter<HPacket> = createEntityAdapter<HPacket>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  selectedHPacketId: null,
});

export const reducer = createReducer(
  initialState,
  on(HPacketActions.loadHPackets, (state) => {
    return { ...state };
  }),
  on(HPacketActions.loadHPacketsSuccess, (state, { hPackets }) => {
    return adapter.setAll(hPackets, state);
  }),
  on(HPacketActions.loadHPacketsFailure, (state, { error }) => {
    return { ...state };
  }),
  on(HPacketActions.addHPacket, (state, { hPacket }) => {
    return adapter.addOne(hPacket, state)
  }),
  on(HPacketActions.setHPacket, (state, { hPacket }) => {
    return adapter.setOne(hPacket, state)
  }),
  on(HPacketActions.upsertHPacket, (state, { hPacket }) => {
    return adapter.upsertOne(hPacket, state);
  }),
  on(HPacketActions.addHPackets, (state, { hPackets }) => {
    return adapter.addMany(hPackets, state);
  }),
  on(HPacketActions.upsertHPackets, (state, { hPackets }) => {
    return adapter.upsertMany(hPackets, state);
  }),
  on(HPacketActions.updateHPacket, (state, { update }) => {
    return adapter.updateOne(update, state);
  }),
  on(HPacketActions.updateHPackets, (state, { updates }) => {
    return adapter.updateMany(updates, state);
  }),
  on(HPacketActions.mapHPacket, (state, { entityMap }) => {
    return adapter.mapOne(entityMap, state);
  }),
  on(HPacketActions.mapHPackets, (state, { entityMap }) => {
    return adapter.map(entityMap, state);
  }),
  on(HPacketActions.deleteHPacket, (state, { id }) => {
    return adapter.removeOne(id, state);
  }),
  on(HPacketActions.deleteHPackets, (state, { ids }) => {
    return adapter.removeMany(ids, state);
  }),
  on(HPacketActions.deleteHPacketsByPredicate, (state, { predicate }) => {
    return adapter.removeMany(predicate, state);
  }),
  on(HPacketActions.setHPackets, (state, { hPackets }) => {
    return adapter.setMany(hPackets, state);
  }),
  on(HPacketActions.clearHPackets, state => {
    return adapter.removeAll({ ...state, selectedHPacketId: null });
  })
);


export const getSelectedHPacketId = (state: State) => state.selectedHPacketId;

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of liveAlarm ids
export const selectHPacketIds = selectIds;

// select the dictionary of liveAlarm entities
export const selectHPacketEntities = selectEntities;

// select the array of liveAlarms
export const selectAllHPackets = selectAll;

// select the total liveAlarm count
export const selectHPacketTotal = selectTotal;

export const hPacketReducerKey = 'hPackets';