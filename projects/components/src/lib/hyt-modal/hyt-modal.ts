import { Type } from '@angular/core';
import { HytModalService } from './hyt-modal.service';
import { HytModalRef } from './hyt-modal-ref';

export abstract class HytModal {

    protected hytModalref: HytModalRef;

    public data: any;

    constructor(private hytModalService: HytModalService) {
        this.hytModalref = this.hytModalService.modalRef;
        if (this.hytModalService.modalRef && this.hytModalService.modalRef.conf) {
            this.data = (this.hytModalService.modalRef.conf.data) ? this.hytModalService.modalRef.conf.data : {};
        }
    }

    close(data?: any) {
        this.hytModalref.close(data);
    }

}
