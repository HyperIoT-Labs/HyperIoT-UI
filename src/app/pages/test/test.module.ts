import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test.component';
import { HyperiotComponentsModule } from '@hyperiot/components'
import { WidgetsModule } from '@hyperiot/widgets';

import { PlotlyModule } from '@hyperiot/widgets';

@NgModule({
  declarations: [
    TestComponent,
  ],
  imports: [
    CommonModule,
    WidgetsModule,
    HyperiotComponentsModule
  ],
  providers: [],
  exports: [TestComponent]
})
export class TestModule { }
