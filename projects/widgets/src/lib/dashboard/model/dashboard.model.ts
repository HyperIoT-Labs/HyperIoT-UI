import { Widget } from 'core';

export type DashboardPreset = 'readonly' | 'minimal' | 'full';

export interface DashboardPresetItemModel {
  enableAddWidget: boolean;
  enableProjectSelection: boolean;
  enableProjectEdit: boolean;
  enableTopologyToolbar: boolean;
  enableStreamControl: boolean;
  enableOnlineOffline: boolean;
  enableBreadcrumb: boolean;
}
export interface DashboardPresetModel {
  [key: string]: DashboardPresetItemModel;
}

export interface WidgetSelection extends Widget {
  count: number;
}
