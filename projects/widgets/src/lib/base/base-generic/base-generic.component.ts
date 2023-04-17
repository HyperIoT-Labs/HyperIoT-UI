import { Directive, Injector } from '@angular/core';
import { LoggerService } from 'core';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';

@Directive()
export abstract class BaseGenericComponent extends BaseWidgetComponent {

  constructor(
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
  }

  configure(): void {
    this.widgetAction.emit({ widget: this.widget, action: 'widget:ready' });
  }

}
