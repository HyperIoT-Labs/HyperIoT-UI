import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[libHytModalContent]'
})
export class HytModalContentDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
