import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test.component';
import { HyperiotComponentsModule } from '@hyperiot/components'

@NgModule({
  declarations: [TestComponent],
  imports: [
    CommonModule,
    HyperiotComponentsModule
  ],
  providers: [],
  exports: [TestComponent]
})
export class TestModule { }
