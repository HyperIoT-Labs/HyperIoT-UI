import { Component, AfterContentInit, Input, ContentChildren, QueryList } from '@angular/core';
import { HytAccordionItem } from './hyt-directives/hyt-accordion-item.directive';

@Component({
  selector: 'hyt-accordion-group',
  templateUrl: './hyt-accordion-group.component.html',
  styleUrls: ['./hyt-accordion-group.component.scss']
})
export class HytAccordionGroupComponent implements AfterContentInit {
  @Input() collapsing = true;

  @ContentChildren(HytAccordionItem) items: QueryList<HytAccordionItem>;

  expanded = new Set<number>();
  
  constructor() { }

  ngAfterContentInit() {
    console.log('items: ', this.items);

  }

  ngOnInit(): void {}

  getToggleState = (index: number) => {
    return this.toggleState.bind(this, index);
  };

  toggleState = (index: number) => {
    if (this.expanded.has(index)) {
      this.expanded.delete(index);
    } else {
      if (this.collapsing) {
        this.expanded.clear();
      }
      this.expanded.add(index);
    }
  };
}