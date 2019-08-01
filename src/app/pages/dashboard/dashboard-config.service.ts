import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import {
    DashboardwidgetsService,
    DashboardsService,
    DashboardWidget
} from '@hyperiot/core';

@Injectable()
export class DashboardConfigService {
    configUrl = 'assets/data/dashboard-config-rest.json';
    testConfigUrl = 'assets/data/dashboard-config.json';
    widgetCategoryListUrl = 'assets/data/widget-category-list.json';
    widgetListUrl = 'assets/data/widget-list.json';

    constructor(
        private dashboardService: DashboardsService,
        private dashboardWidgetService: DashboardwidgetsService,
        private http: HttpClient
    ) { }

    getDashboardList() {
        return this.dashboardService.findAllDashboard();
    }

    getConfig(dashboardId: string) {
        if (dashboardId === 'demo') {
            return this.getTestConfig();
        }
        // Map DashboardWidget config to Plotly compatible configuration
        const subject = this.dashboardWidgetService.findAllDashboardWidgetInDashboard(+dashboardId)
            .pipe(
                map(
                    (data: any[]) => {
                        const config = [];
                        // Normalize data received from server
                        data.map((w: DashboardWidget) => {
                            const widget = JSON.parse(w.widgetConf);
                            widget.id = w.id;
                            widget.widgetId = `widget-${w.id}`;
                            config.push(widget);
                        });
                        return config;
                    },
                    error => console.log(error)
                )
            );
        return subject;
    }
    getTestConfig() {
        return this.http.get(this.testConfigUrl);
    }
    putConfig(dashboardId: string, config: any) {
        const dashboardWidgets: DashboardWidget[] = [];
        // Map Plotly config to HyperIoT-DashboardWidget compatible configuration
        config.slice().map((d) => {
            // Create a copy of widget configuration
            const widgetConf: any = {};
            Object.assign(widgetConf, d);
            // Remove properties that are redundant
            // or reserved for internal-use
            delete widgetConf.id;
            delete widgetConf.widgetId;
            delete widgetConf.instance;
            // Create and populate DashboardWidget entity
            const widget: DashboardWidget = {
                id: d.id,
                widgetId: d.widgetId,
                widgetConf: JSON.stringify(widgetConf)
            };
            // Add it to the list of dashboard widgets
            dashboardWidgets.push(widget);
        });
        // Save the dashboard structure
        return this.dashboardWidgetService
            .saveAllDashboardWidget(+dashboardId, dashboardWidgets);
    }
    getWidgetCategoryList() {
        return this.http.get(this.widgetCategoryListUrl);
    }
    getWidgetList() {
        return this.http.get(this.widgetListUrl);
    }
}
