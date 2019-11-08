import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnDestroy,
  Injector
} from '@angular/core';

import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { HytModal } from 'src/app/services/hyt-modal';

@Component({
  selector: 'hyt-widget-settings-dialog',
  templateUrl: './widget-settings-dialog.component.html',
  styleUrls: ['./widget-settings-dialog.component.scss']
})
export class WidgetSettingsDialogComponent extends HytModal implements OnInit, OnDestroy {

  modalApply: Subject<any> = new Subject();
  @Input() widget;
  @Input() widgetName;
  @Input() widgetId: string;
  @ViewChild(NgForm, { static: true }) settingsForm: NgForm;

  dialogDataState = 0;

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  modalIsOpen = false;

  // open modal
  open(): void {
    this.dialogDataState = 0;
    super.open();
    this.modalIsOpen = true;
    this.dialogDataState = 1;
  }

  // close modal
  close(event?): void {
    super.close();
    this.modalIsOpen = false;
  }

  getWidgetId() {
    return this.widgetId;
  }

  setWidget(w: any) {
    this.widget = w;
    this.widgetName = w.name;
  }

  confirm($event) {
    // common config options
    this.widget.name = this.widgetName;
    // signal 'apply' to widget specific config component
    this.modalApply.next('apply');
    // reconfigure widget instance with new values
    this.widget.instance.configure();
    // close dialog
    // this.close($event);

    this.modalClose.emit($event);
    this.close();
  }

  dismiss(e: any) {
    if (e.target === this.viewContainer.nativeElement) {
      // this.close(e);
      this.close();
    }
  }

  // open() {
  //   // TODO: init stuff goes here
  // }

  // close($event?) {
  //   this.router.navigate(
  //     ['../', { outlets: { modal: null } }],
  //     { relativeTo: this.activatedRoute }
  //   );
  //   this.modalClose.emit($event);
  // }
}
