import { OverlayRef } from '@angular/cdk/overlay';
import { Subject, Observable } from 'rxjs';

export class DialogRef<T> {
  private afterClosedSubject = new Subject<T>();

  constructor(
    private overlayRef: OverlayRef,
    private isBackgroundClosable?: boolean,
  ) {
    overlayRef?.backdropClick().subscribe(() => {
      if (isBackgroundClosable) {
        this.close();
      } else {
        overlayRef?.overlayElement.animate(
          [
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-3px)' },
            { transform: 'translateX(0px)' },
            { transform: 'translateX(3px)' },
            { transform: 'translateX(0px)' },
          ],
          {
            duration: 100,
            iterations: 5,
          }
        );
      }
    });
  }

  public close(result?: T) {
    this.overlayRef.dispose();
    this.afterClosedSubject.next(result);
    this.afterClosedSubject.complete();
  }

  public afterClosed(): Observable<T> {
    return this.afterClosedSubject.asObservable();
  }
}
