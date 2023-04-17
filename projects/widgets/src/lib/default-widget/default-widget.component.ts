import { Component, Injector } from '@angular/core';
import { LoggerService } from 'core';
import { BaseWidgetComponent } from '../base/base-widget/base-widget.component';

@Component({
  selector: 'hyperiot-default-widget',
  templateUrl: './default-widget.component.html',
  styleUrls: ['./default-widget.component.css']
})
export class DefaultWidgetComponent extends BaseWidgetComponent {

  constructor(injector: Injector, protected loggerService: LoggerService) {
    super(injector, loggerService);
  }

  configure(): void {
    throw new Error('Unavailable widget.');
  }

  onToolbarAction(action: string) {
    this.widgetAction.emit({ widget: this.widget, action });
  }

}
