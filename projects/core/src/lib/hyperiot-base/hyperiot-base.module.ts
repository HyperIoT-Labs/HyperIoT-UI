import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DevDataService } from './dev-data-service/dev-data.service';
import { OfflineDataService } from './offline-data-service/offline-data.service';
import { RealtimeDataService } from './realtime-data-service/realtime-data.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
  ],
  providers: [
    DevDataService,
    OfflineDataService,
    RealtimeDataService,
  ]
})
export class HyperiotBaseModule { }

