import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CoreComponent } from './core.component';
import { HyperiotClientModule } from './hyperiot-client/hyperiot-client.module';
import { CoreConfig } from './config.service';



@NgModule({
  declarations: [
    CoreComponent,
  ],
  imports: [
    HyperiotClientModule,
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
