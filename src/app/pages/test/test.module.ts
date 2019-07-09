import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test.component';

@NgModule({
  declarations: [TestComponent],
  imports: [
    CommonModule
  ],
  providers: [],
  exports: [TestComponent]
})
export class TestModule { }
