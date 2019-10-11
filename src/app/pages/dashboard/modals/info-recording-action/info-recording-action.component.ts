import { Component, OnInit, Input, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { DashboardConfigService } from '../../dashboard-config.service';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';

@Component({
  selector: 'hyt-info-recording-action',
  templateUrl: './info-recording-action.component.html',
  styleUrls: ['./info-recording-action.component.scss']
})
export class InfoRecordingActionComponent implements OnInit, OnDestroy {

  @Input() id: string;
  private element: any;

  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private viewContainer: ElementRef,
    private dashboardConfigService: DashboardConfigService,
    private hytModalService: HytModalConfService
  ) {
    this.element = viewContainer.nativeElement;
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
  }

  // remove self from modal service when directive is destroyed
  ngOnDestroy(): void {
    this.hytModalService.remove(this.id);
    this.element.remove();
  }

  // open modal
  open(): void {
    this.element.classList.add('open');
    document.body.classList.add('hyt-modal-open');
  }

  // close modal
  close(): void {
    this.element.classList.remove('open');
    document.body.classList.remove('hyt-modal-open');
  }

  next(event) {
    this.modalClose.emit(true)
    this.close()
  }

  back(event) {
    this.modalClose.emit(false)
    this.close()
  }
  
}
