import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

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

    getDashboard(dashboardId: number) {
        return this.dashboardService.findDashboard(dashboardId);
    }

    addDashboardWidget(dashboardId: number, widget: any) {
        // creates a copy of widget object and
        // remove redundant properties
        delete widget.id;
        const dashboardWidget: DashboardWidget = {
            dashboard: { id: dashboardId, entityVersion: null },
            widgetConf: JSON.stringify(widget),
            entityVersion: null
        };
        const subject = new Subject();
        this.dashboardWidgetService.saveDashboardWidget(dashboardWidget)
            .subscribe((w: DashboardWidget) => {
                // update new widget id
                widget.id = w.id;
                widget.entityVersion = w.entityVersion;
                subject.next(widget);
                subject.unsubscribe();
            });
        return subject;
    }
    removeDashboardWidget(widgetId: number) {
        return this.dashboardWidgetService.deleteDashboardWidget(widgetId);
    }

    getConfig(dashboardId: number | string) {
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
                            widget.entityVersion = w.entityVersion;
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
    putConfig(dashboardId: number, config: any) {
        const dashboardWidgets: DashboardWidget[] = [];
        // Map Plotly config to HyperIoT-DashboardWidget compatible configuration
        config.slice().map((d: DashboardWidget) => {
            // Create a copy of widget configuration
            const widgetConf: any = {};
            Object.assign(widgetConf, d);
            // Remove properties that are redundant
            // or reserved for internal-use
            delete widgetConf.id;
            delete widgetConf.instance;
            // Create and populate DashboardWidget entity
            const widget: DashboardWidget = {
                id: d.id,
                widgetConf: JSON.stringify(widgetConf),
                entityVersion: d.entityVersion
            };
            // Add it to the list of dashboard widgets
            dashboardWidgets.push(widget);
        });
        // Save the dashboard structure
        console.log('Saving Dashboard', dashboardId, dashboardWidgets);
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
