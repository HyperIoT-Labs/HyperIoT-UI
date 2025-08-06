import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { AlarmsService } from './api/alarms.service';
import { AlarmsEventsService } from './api/alarmsEvents.service';
import { AlgorithmService } from './api/algorithm.service';
import { Area_Service } from './api/area_.service';
import { AssetCategoriesService } from './api/assetCategories.service';
import { AssetTagsService } from './api/assetTags.service';
import { AuthenticationService } from './api/authentication.service';
import { CompanyService } from './api/company.service';
import { DashboardWidgetsService } from './api/dashboardWidgets.service';
import { DashboardsService } from './api/dashboards.service';
import { DiagnoseTypeService } from './api/diagnoseType.service';
import { HBaseConnectorService } from './api/hBaseConnector.service';
import { HDevicesService } from './api/hDevices.service';
import { HPacketService } from './api/hPacket.service';
import { HProjectService } from './api/hProject.service';
import { HProjectAlgorithmsService } from './api/hProjectAlgorithms.service';
import { HUserService } from './api/hUser.service';
import { KafkaConnectorService } from './api/kafkaConnector.service';
import { KitService } from './api/kit.service';
import { MailTemplatesService } from './api/mailTemplates.service';
import { PermissionsService } from './api/permissions.service';
import { RuleEngineService } from './api/ruleEngine.service';
import { ServicesService } from './api/services.service';
import { SharedEntityService } from './api/sharedEntity.service';
import { SparkManagerService } from './api/sparkManager.service';
import { StormService } from './api/storm.service';
import { UIBrandingService } from './api/uIBranding.service';
import { WidgetsService } from './api/widgets.service';
import { ZookeeperConnectorService } from './api/zookeeperConnector.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    AlarmsService,
    AlarmsEventsService,
    AlgorithmService,
    Area_Service,
    AssetCategoriesService,
    AssetTagsService,
    AuthenticationService,
    CompanyService,
    DashboardWidgetsService,
    DashboardsService,
    DiagnoseTypeService,
    HBaseConnectorService,
    HDevicesService,
    HPacketService,
    HProjectService,
    HProjectAlgorithmsService,
    HUserService,
    KafkaConnectorService,
    KitService,
    MailTemplatesService,
    PermissionsService,
    RuleEngineService,
    ServicesService,
    SharedEntityService,
    SparkManagerService,
    StormService,
    UIBrandingService,
    WidgetsService,
    ZookeeperConnectorService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
