import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CoreComponent } from './core.component';
import { CoreConfig } from './config.service';
import {ApiModule} from "./hyperiot-client/hyt-api/api-module";



@NgModule({
  declarations: [
    CoreComponent,
  ],
  imports: [
    ApiModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (config: CoreConfig) => {
        return () => {
          config.fetchAvailableOperations();
          return config.configReady$;
        };
      },
      deps: [ CoreConfig ],
    },
  ],
  exports: [
    CoreComponent,
  ]
})
export class CoreModule { }
