import { createSelector } from '@ngrx/store';
import { Rule } from 'core';

export interface RulesState {
  rules: Rule[];
}
 
const selectRules = (state: RulesState) => state.rules;
 
const selectRuleById = (id: number) => createSelector(
    selectRules,
    (state: Rule[]) => state.find(x => x.id === id),
);

export const RulesSelectors = {
  selectRules,
  selectRuleById,
}