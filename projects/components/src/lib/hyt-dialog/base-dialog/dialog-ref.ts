import { OverlayRef } from '@angular/cdk/overlay';
import { Subject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

/**
 * A reference to the dialog itself.
 * Can be injected into the component added to the overlay and then used to close itself.
 */

export class DialogRef<T> {
    private afterClosedSubject = new Subject<T>();

    constructor(
        private overlayRef?: OverlayRef,
        private isBackgroundClosable?: boolean
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

    /**
     * Closes the overlay. You can optionally provide a result.
     */
    public close(result?: T) {
        this.overlayRef?.dispose();
        this.afterClosedSubject.next(result);
        this.afterClosedSubject.complete();
    }

    /**
     * An Observable that notifies when the overlay has closed
     */
    public afterClosed(): Observable<T> {
        return this.afterClosedSubject.asObservable();
    }
}
