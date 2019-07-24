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
        const subject = this.dashboardWidgetService.findAllDashboardWidget(+dashboardId)
            .pipe(
                map(
                    (data: any[]) => {
                        const config = [];
                        // Normalize data received from server
                        data.map((w: DashboardWidget) => {
                            const widget = JSON.parse(w.widgetConf);
                            widget.id = w.id;
                            widget.widgetId = w.widgetId;
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
            const widgetConf: any = {};
            Object.assign(widgetConf, d);
            delete widgetConf.id;
            const widget: DashboardWidget = {
                dashboard: null,
                id: d.id,
                widgetId: d.widgetId,
                widgetConf: JSON.stringify(widgetConf)
            };
            dashboardWidgets.push(widget);
        });
        return this.dashboardWidgetService
            .saveAllDashboardWidget(+dashboardId, dashboardWidgets);
    }
}
