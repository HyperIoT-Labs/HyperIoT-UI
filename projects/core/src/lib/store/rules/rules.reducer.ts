import { createReducer, on, Store } from "@ngrx/store";
import { Rule } from "../../hyperiot-client/hyt-api/api-module";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { RuleActions } from "./rules.actions";

export namespace RuleStore {

  export const key = 'rules';

  export const adapter: EntityAdapter<Rule> = createEntityAdapter<Rule>();

  export interface State extends EntityState<Rule> {
    // additional entities state properties
    selectedRuleId: string | null;
  }

  export const initialState: State = adapter.getInitialState({
    // additional entity state properties
    selectedRuleId: null,
  });

  export const reducer = createReducer(
    initialState,
    on(RuleActions.loadRules, (state) => {
      return { ...state };
    }),
    on(RuleActions.loadRulesSuccess, (state, { rules }) => {
      return adapter.setAll(rules, state);
    }),
    on(RuleActions.loadRulesFailure, (state, { error }) => {
      return { ...state };
    }),
    on(RuleActions.addRule, (state, { rule }) => {
      return adapter.addOne(rule, state)
    }),
    on(RuleActions.setRule, (state, { rule }) => {
      return adapter.setOne(rule, state)
    }),
    on(RuleActions.upsertRule, (state, { rule }) => {
      return adapter.upsertOne(rule, state);
    }),
    on(RuleActions.addRules, (state, { rules }) => {
      return adapter.addMany(rules, state);
    }),
    on(RuleActions.upsertRules, (state, { rules }) => {
      return adapter.upsertMany(rules, state);
    }),
    on(RuleActions.updateRule, (state, { update }) => {
      return adapter.updateOne(update, state);
    }),
    on(RuleActions.updateRules, (state, { updates }) => {
      return adapter.updateMany(updates, state);
    }),
    on(RuleActions.mapRule, (state, { entityMap }) => {
      return adapter.mapOne(entityMap, state);
    }),
    on(RuleActions.mapRules, (state, { entityMap }) => {
      return adapter.map(entityMap, state);
    }),
    on(RuleActions.deleteRule, (state, { id }) => {
      return adapter.removeOne(id, state);
    }),
    on(RuleActions.deleteRules, (state, { ids }) => {
      return adapter.removeMany(ids, state);
    }),
    on(RuleActions.deleteRulesByPredicate, (state, { predicate }) => {
      return adapter.removeMany(predicate, state);
    }),
    on(RuleActions.setRules, (state, { rules }) => {
      return adapter.setMany(rules, state);
    }),
    on(RuleActions.clearRules, state => {
      return adapter.removeAll({ ...state, selectedRuleId: null });
    })
  );

  export const getSelectedRuleId = (state: State) => state.selectedRuleId;

  // get the selectors
  const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
  } = adapter.getSelectors();

  // select the array of liveAlarm ids
  export const selectRuleIds = selectIds;

  // select the dictionary of liveAlarm entities
  export const selectRuleEntities = selectEntities;

  // select the array of liveAlarms
  export const selectAllRules = selectAll;

  // select the total liveAlarm count
  export const selectRuleTotal = selectTotal;

}
