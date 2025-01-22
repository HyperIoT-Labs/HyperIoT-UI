import { EntityMap, EntityMapOne, Predicate, Update } from "@ngrx/entity";
import { createAction, props } from "@ngrx/store";
import { HPacket } from "../../hyperiot-client/hyt-api/api-module";

export namespace HPacketActions {
    export const loadHPackets = createAction('[HPacket/API] Load HPackets');
    export const loadHPacketsSuccess = createAction('[HPacket/API] Load HPackets Success', props<{ hPackets: HPacket[] }>());
    export const loadHPacketsFailure = createAction('[HPacket/API] Load HPackets Failure', props<{ error: any }>());

    export const setHPackets = createAction('[HPacket/API] Set HPackets', props<{ hPackets: HPacket[] }>());
    export const addHPacket = createAction('[HPacket/API] Add HPacket', props<{ hPacket: HPacket }>());
    export const setHPacket = createAction('[HPacket/API] Set HPacket', props<{ hPacket: HPacket }>());
    export const upsertHPacket = createAction('[HPacket/API] Upsert HPacket', props<{ hPacket: HPacket }>());
    export const addHPackets = createAction('[HPacket/API] Add HPackets', props<{ hPackets: HPacket[] }>());
    export const upsertHPackets = createAction('[HPacket/API] Upsert HPackets', props<{ hPackets: HPacket[] }>());
    export const updateHPacket = createAction('[HPacket/API] Update HPacket', props<{ update: Update<HPacket> }>());
    export const updateHPackets = createAction('[HPacket/API] Update HPackets', props<{ updates: Update<HPacket>[] }>());
    export const mapHPacket = createAction('[HPacket/API] Map HPacket', props<{ entityMap: EntityMapOne<HPacket> }>());
    export const mapHPackets = createAction('[HPacket/API] Map HPackets', props<{ entityMap: EntityMap<HPacket> }>());
    export const deleteHPacket = createAction('[HPacket/API] Delete HPacket', props<{ id: number }>());
    export const deleteHPackets = createAction('[HPacket/API] Delete HPackets', props<{ ids: number[] }>());
    export const deleteHPacketsByPredicate = createAction('[HPacket/API] Delete HPackets By Predicate', props<{ predicate: Predicate<HPacket> }>());
    export const clearHPackets = createAction('[HPacket/API] Clear HPackets');
}
