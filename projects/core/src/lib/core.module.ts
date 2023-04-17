import { NgModule } from '@angular/core';
import { CoreComponent } from './core.component';
import { HyperiotClientModule } from './hyperiot-client/hyperiot-client.module';



@NgModule({
  declarations: [
    CoreComponent,
  ],
  imports: [
    HyperiotClientModule,
  ],
  exports: [
    CoreComponent,
  ]
})
export class CoreModule { }
