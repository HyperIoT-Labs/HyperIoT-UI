import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromRule from './rules.reducer'

export const selectRuleState = createFeatureSelector<fromRule.State>(fromRule.ruleReducerKey);
  
export const selectRuleIds = createSelector(
  selectRuleState,
  fromRule.selectRuleIds // shorthand for usersState => fromRule.selectRuleIds(usersState)
);
export const selectRuleEntities = createSelector(
  selectRuleState,
  fromRule.selectRuleEntities
);
export const selectAllRules = createSelector(
  selectRuleState,
  fromRule.selectAllRules
);
export const selectRuleTotal = createSelector(
  selectRuleState,
  fromRule.selectRuleTotal
);
export const selectCurrentRuleId = createSelector(
  selectRuleState,
  fromRule.getSelectedRuleId
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

export const RuleSelectors = {
  selectRuleState,
  selectRuleIds,
  selectRuleEntities,
  selectAllRules,
  selectRuleTotal,
  selectCurrentRuleId,
  selectCurrentRule,
}