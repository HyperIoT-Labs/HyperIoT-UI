import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpEvent, HttpResponse } from '@angular/common/http';

import { map, catchError, tap } from 'rxjs/operators';
import { Subject, forkJoin, of, mergeMap, Observable } from 'rxjs';

import {
    DashboardwidgetsService,
    DashboardsService,
    DashboardWidget,
    HprojectsService,
    AreasService,
    Dashboard,
    StormService,
} from 'core';
import { DashboardWidgetPlus } from 'components';
import { WidgetConfig } from '../base/base-widget/model/widget.model';
import { IGNORE_ERROR_NOTIFY } from 'core';

@Injectable()
export class DashboardConfigService {
    configUrl = 'assets/data/dashboard-config-rest.json';
    testConfigUrl = 'assets/data/dashboard-config.json';
    widgetCategoryListUrl = 'assets/data/widget-category-list.json';
    widgetListUrl = 'assets/data/widget-list.json';

    constructor(
        private dashboardService: DashboardsService,
        private dashboardWidgetService: DashboardwidgetsService,
        private hProjectService: HprojectsService,
        private areaService: AreasService,
        private stormService: StormService,
        private http: HttpClient
    ) { }

    getRealtimeDashboardFromProject(projectId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
        return this.dashboardService.findHProjectRealtimeDashboard(projectId);
    }

    getOfflineDashboardFromProject(projectId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
        return this.dashboardService.findHProjectOfflineDashboard(projectId);
    }

    getRealtimeDashboardFromArea(areaId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
        return this.dashboardService.findAreaRealtimeDashboard(areaId);
    }

    getOfflineDashboardFromArea(areaId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
        return this.dashboardService.findAreaOfflineDashboard(areaId);
    }

    getRealtimeDashboardFromHDevice(hDeviceId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
      return this.dashboardService.findDeviceRealtimeDashboard(hDeviceId);
    }

    getOfflineDashboardFromHDevice(hDeviceId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
      return this.dashboardService.findDeviceOfflineDashboard(hDeviceId);
    }

    getAllDashboardsAndProjects() {

        return forkJoin([
            this.hProjectService.cardsView()/*.pipe(
                catchError(err => of(err))
            )*/,
            this.dashboardService.findAllDashboard()/*.pipe(
                catchError(err => of(err))
            )*/
        ]);

    }

    getProjectsList(): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
        return this.hProjectService.findAllHProject();
    }

    getAreasList(projectId: number) {
        return this.hProjectService.getHProjectAreaList(projectId);
    }

    getDashboardList() {
        return this.dashboardService.findAllDashboard();
    }

    getDashboard(dashboardId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
        return this.dashboardService.findDashboard(dashboardId);
    }

    saveDashboard(dashboard: Dashboard) {
        this.dashboardService.saveDashboard(dashboard);
    }

    addDashboardWidget(dashboardId: number, widget: WidgetConfig) {
        // creates a copy of widget object and
        // remove redundant properties
        const dashboardWidget: any = { // TODO swagger discrepancy
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
    removeDashboardWidget(widgetId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any  {
        return this.dashboardWidgetService.deleteDashboardWidget(widgetId);
    }

    getConfig(projectId: number | string, dashboardId: number | string): any {
        if (dashboardId === 'demo') {
            return this.getTestConfig();
        }
        // Map DashboardWidget config to Plotly compatible configuration
        const subject = this.dashboardWidgetService.findAllDashboardWidgetInDashboard(+dashboardId)[0]
            .pipe(
              tap(el => console.log('Service|dashboard-config|getConfig')),
              map((data: any[]) => {
                  const config = [];
                  // Normalize data received from server
                  data.map((w: DashboardWidget) => {
                      const widget = JSON.parse(w.widgetConf);
                      widget.projectId = +projectId;
                      widget.id = w.id;
                      widget.entityVersion = w.entityVersion;
                      config.push(widget);
                  });
                  return config;
                })
            );
        return subject;
    }
    getTestConfig() {
        return this.http.get(this.testConfigUrl);
    }
    putConfig(dashboardId: number, config: any): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
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
        // console.log('Saving Dashboard', dashboardId, dashboardWidgets);
        return this.dashboardWidgetService
            .saveAllDashboardWidget(+dashboardId, dashboardWidgets, 'body', false, new HttpContext().set(IGNORE_ERROR_NOTIFY, true));
    }

    getWidgetCategoryList() {
        return this.http.get(this.widgetCategoryListUrl);
    }

    getWidgetList() {
        return this.http.get(this.widgetListUrl);
    }

    postRecordingStateOn(projectId: number) {
        return this.stormService.submitProjectTopology(projectId);
    }

    postRecordingStateOff(projectId: number) {
        return this.stormService.killTopology(projectId);
    }

    getRecordingStatus(projectId: number): Observable<any> | Observable<HttpResponse<any>> | Observable<HttpEvent<any>> | any {
        return this.stormService.getTopology(projectId);
    }

}
