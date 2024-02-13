import { Component, Injector, OnInit } from '@angular/core';
import { Logger, LoggerService } from 'core';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';

@Component({
  selector: 'hyperiot-dynamic-label-value-widget',
  templateUrl: './dynamic-label-value-widget.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './dynamic-label-value-widget.component.scss']
})
export class DynamicLabelValueWidgetComponent
  extends BaseWidgetComponent
  implements OnInit {

  labels: Array<string> = ['Versione', 'Operatore', 'Ordine', 'Materia Prima', 'Sacchi prodotti', 'Sacchi residui'];
  values: Array<any> = ['1.2.3', 'Massimo', 21332, 'Plastica', 20, 100];

  loadingOfflineData: boolean = false;

  protected logger: Logger;

  constructor(
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
    debugger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(DynamicLabelValueWidgetComponent.name);
  }

  ngOnInit(): void {
    debugger
    super.ngOnInit();
    this.configure();
  }

  configure() {
    debugger
    if (
      !(
        this.widget.config != null &&
        this.widget.config.packetId != null &&
        this.widget.config.packetFields != null &&
        Object.keys(this.widget.config.packetFields).length > 0
      )
    ) {
      this.isConfigured = false;
      return;
    }
    this.isConfigured = true;
  }

  isString(value: string | number): boolean {
    return typeof value === 'string';
  }
}
