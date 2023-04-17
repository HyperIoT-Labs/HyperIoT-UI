import { Component, OnInit } from '@angular/core';
import {HytModal} from "../hyt-modal";
import {HytModalService} from "../hyt-modal.service";

@Component({
  selector: 'hyt-generic-message-dialog',
  templateUrl: './hyt-generic-message-dialog.component.html',
  styleUrls: ['./hyt-generic-message-dialog.component.scss']
})
export class HytGenericMessageDialogComponent extends HytModal implements OnInit {

  constructor(
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  ngOnInit() {
  }

}
