import { createFeatureSelector, createSelector } from '@ngrx/store';

import { RuleStore } from './rules.reducer'

export namespace RuleSelectors {
  export const selectRuleState = createFeatureSelector<RuleStore.State>(RuleStore.key);
  
  export const selectRuleIds = createSelector(
    selectRuleState,
    RuleStore.selectRuleIds // shorthand for usersState => RuleStore.selectRuleIds(usersState)
  );
  export const selectRuleEntities = createSelector(
    selectRuleState,
    RuleStore.selectRuleEntities
  );
  export const selectAllRules = createSelector(
    selectRuleState,
    RuleStore.selectAllRules
  );
  export const selectRuleTotal = createSelector(
    selectRuleState,
    RuleStore.selectRuleTotal
  );
  export const selectCurrentRuleId = createSelector(
    selectRuleState,
    RuleStore.getSelectedRuleId
  );
  
  export const selectCurrentRule = createSelector(
    selectRuleEntities,
    selectCurrentRuleId,
    (alarmEnetities, userId) => userId && alarmEnetities[userId]
  );
  
  export const selectRuleById = (props: {id: number}) => createSelector(
    selectRuleEntities,
    (ruleEnetities) => props.id && ruleEnetities[props.id]
  );
  
}
