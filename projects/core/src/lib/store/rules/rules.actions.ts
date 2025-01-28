import { EntityMap, EntityMapOne, Predicate, Update } from "@ngrx/entity";
import { createAction, props } from "@ngrx/store";
import { Rule } from "../../hyperiot-client/models/rule";

export namespace RuleActions {

    export const loadRules = createAction('[Rule/API] Load Rules');
    export const loadRulesSuccess = createAction('[Rule/API] Load Rules Success', props<{ rules: Rule[] }>());
    export const loadRulesFailure = createAction('[Rule/API] Load Rules Failure', props<{ error: any }>());

    export const setRules = createAction('[Rule/API] Set Rules', props<{ rules: Rule[] }>());
    export const addRule = createAction('[Rule/API] Add Rule', props<{ rule: Rule }>());
    export const setRule = createAction('[Rule/API] Set Rule', props<{ rule: Rule }>());
    export const upsertRule = createAction('[Rule/API] Upsert Rule', props<{ rule: Rule }>());
    export const addRules = createAction('[Rule/API] Add Rules', props<{ rules: Rule[] }>());
    export const upsertRules = createAction('[Rule/API] Upsert Rules', props<{ rules: Rule[] }>());
    export const updateRule = createAction('[Rule/API] Update Rule', props<{ update: Update<Rule> }>());
    export const updateRules = createAction('[Rule/API] Update Rules', props<{ updates: Update<Rule>[] }>());
    export const mapRule = createAction('[Rule/API] Map Rule', props<{ entityMap: EntityMapOne<Rule> }>());
    export const mapRules = createAction('[Rule/API] Map Rules', props<{ entityMap: EntityMap<Rule> }>());
    export const deleteRule = createAction('[Rule/API] Delete Rule', props<{ id: number }>());
    export const deleteRules = createAction('[Rule/API] Delete Rules', props<{ ids: number[] }>());
    export const deleteRulesByPredicate = createAction('[Rule/API] Delete Rules By Predicate', props<{ predicate: Predicate<Rule> }>());
    export const clearRules = createAction('[Rule/API] Clear Rules');

}
