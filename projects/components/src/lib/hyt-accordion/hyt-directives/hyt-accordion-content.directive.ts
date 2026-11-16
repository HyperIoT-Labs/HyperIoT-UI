import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: "[accordionContent]",
    standalone: false
})
  export class HytAccordionContent {
    constructor(public elementRef: ElementRef) {
      return elementRef.nativeElement;
    }
  }