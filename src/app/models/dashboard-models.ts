import { DashboardWidget, Dashboard } from '@hyperiot/core';

export interface DashboardWidgetPlus extends DashboardWidget {
    dashboard?: Dashboard;
}