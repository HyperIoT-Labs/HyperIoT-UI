import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: "[accordionHeader]",
    standalone: false
})
export class HytAccordionHeader {
  constructor(public templateRef: TemplateRef<any>) {}
}