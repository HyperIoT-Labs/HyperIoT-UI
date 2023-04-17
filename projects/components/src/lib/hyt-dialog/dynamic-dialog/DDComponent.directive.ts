import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[hytDdComponent]',
})
export class DDComponentDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}