import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FileHandlerService } from './hyperiot-file-handler/file-handler.service';
import { LoggerService } from './hyperiot-logger/logger.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [],
  providers: [
    FileHandlerService,
    LoggerService,
  ]
})
export class HyperiotServiceModule { }
