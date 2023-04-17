import { DashboardWidget, Dashboard } from 'core';

export interface DashboardWidgetPlus extends DashboardWidget {
    dashboard?: Dashboard;
}
