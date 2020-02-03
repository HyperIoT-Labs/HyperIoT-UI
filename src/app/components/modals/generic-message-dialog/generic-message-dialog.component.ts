import { Component, OnInit } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';

@Component({
  selector: 'hyt-generic-message-dialog',
  templateUrl: './generic-message-dialog.component.html',
  styleUrls: ['./generic-message-dialog.component.scss']
})
export class GenericMessageDialogComponent extends HytModal implements OnInit {

  constructor(
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  ngOnInit() {
  }

}
