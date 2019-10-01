import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';

@Component({
  selector: 'hyt-widget-settings-dialog',
  templateUrl: './widget-settings-dialog.component.html',
  styleUrls: ['./widget-settings-dialog.component.scss']
})
export class WidgetSettingsDialogComponent implements OnInit, OnDestroy {
  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();
  modalApply: Subject<any> = new Subject();
  @Input() widget;
  @Input() widgetName;
  @Input() widgetId: string;
  @ViewChild(NgForm, { static: true }) settingsForm: NgForm;

  @Input() id: string;
  private element: any;

  constructor(
    private viewContainer: ElementRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private hytModalService: HytModalConfService
  ) {
    this.element = viewContainer.nativeElement;
    // this.widgetId = this.activatedRoute.snapshot.paramMap.get('widgetId');
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key.toUpperCase() === 'ESCAPE') {
      // this.close(event);
      this.close();
    }
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
        if (e.target.className === 'hyt-modal') {
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

  modalIsOpen: boolean = false;

  // open modal
  open(): void {
    this.element.style.display = 'block';
    document.body.classList.add('hyt-modal-open');
    this.modalIsOpen = true;
  }

  // close modal
  close(event?): void {
    this.element.style.display = 'none';
    document.body.classList.remove('hyt-modal-open');
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
