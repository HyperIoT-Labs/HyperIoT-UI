import { Type, OnInit, Directive } from '@angular/core';
import { Observable, Subject, Subscriber } from 'rxjs';
import { HytModalService } from './hyt-modal.service';
import { HytModalConf } from './hyt-modal-conf';

@Directive()
export class HytModalRef implements OnInit {

    public onClosed = new Subject<any>();

    constructor(
        public component: Type<any>,
        // TODO circular dependency. HytModalRef imports hytModalService but it's also imported by hytModalService.
        // Close method shouldn't use hytModalService. Modal system will be replaced by Dialog system
        private hytModalService: HytModalService,
        public conf?: HytModalConf
    ) {}

    ngOnInit() { }

    close(data?: any) {
        if (data) { this.onClosed.next(data); } else { this.onClosed.complete(); }
        this.hytModalService.close();
    }

}
