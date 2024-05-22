import { Directive, Host, Input, OnDestroy } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatSelect } from '@angular/material/select';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * The CustomSelectPositionDirective is designed to modify the default behavior of the Angular Material mat-select component.
 * By default, the mat-select dropdown position is determined based on the selected option and screen position,
 * which can result in inconsistent dropdown placement.
 * 
 * This directive ensures that the dropdown is always rendered either below or above the select component
 * depending on its position on the screen. If the select component is near the bottom of the screen, 
 * the dropdown will appear above it; otherwise, it will appear below.
 * 
 * Usage:
 * Apply the [positionSelect] directive to your mat-select component to enable this behavior.
 * In our case pass the [positionSelect]=true to the hyt-select component
 */
@Directive({
  selector: '[positionSelect]'
})
export class CustomSelectPositionDirective implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  @Input() changePositionStrategy: boolean = true;

  constructor(private overlay: Overlay, @Host() private matSelect: MatSelect) {
    this.matSelect.openedChange.pipe(takeUntil(this.destroy$)).subscribe(open => {
      if (open && this.changePositionStrategy) {
        this.updatePositionStrategy();
      }
    });
  }

  private updatePositionStrategy() {
    const overlayRef: OverlayRef = this.matSelect['_overlayDir'].overlayRef;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.matSelect._elementRef.nativeElement)
      .withPositions([
        // Define your custom positions here
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
        }
      ]);

      overlayRef.updatePositionStrategy(positionStrategy);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
