import { HytModalContentDirective } from './hyt-modal-content.directive';
import { ViewContainerRef } from '@angular/core';

describe('HytModalContentDirective', () => {

  let viewContainerRef: ViewContainerRef;

  it('should create an instance', () => {
    const directive = new HytModalContentDirective(viewContainerRef);
    expect(directive).toBeTruthy();
  });
});
