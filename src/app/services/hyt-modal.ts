import { HostListener, Input, Output, EventEmitter, ElementRef, OnInit, OnDestroy, Injector } from '@angular/core';
import { HytModalConfService } from './hyt-modal-conf.service';

export abstract class HytModal implements OnInit, OnDestroy {

    @Input()
    id: string;

    private element: any;

    @Output()
    modalClose: EventEmitter<any> = new EventEmitter<any>();

    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if (event.key.toUpperCase() === 'ESCAPE') {
            // this.close(event);
            this.close();
        }
    }

    protected viewContainer: ElementRef;
    protected hytModalService: HytModalConfService;

    constructor(
        injector: Injector
    ) {
        this.viewContainer = injector.get(ElementRef);
        this.hytModalService = injector.get(HytModalConfService);
        this.element = this.viewContainer.nativeElement;
    }

    ngOnInit() {
        let modal = this;

        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        document.body.appendChild(this.element);

        // close modal on background click
        this.element.addEventListener('click', function (e: any) {
            if (e.target.className === 'hyt-modal-background') {
                modal.close();
            }
        });

        // add self (this modal instance) to the modal service so it's accessible from controllers
        this.hytModalService.add(this);

        // this.open();
    }

    // remove self from modal service when directive is destroyed
    ngOnDestroy(): void {
        this.hytModalService.remove(this.id);
        this.element.remove();
    }

    open(): void {
        this.element.classList.add('open');
        document.body.classList.add('hyt-modal-open');
    }
    close(): void {
        this.element.classList.remove('open');
        document.body.classList.remove('hyt-modal-open');
    }

}
