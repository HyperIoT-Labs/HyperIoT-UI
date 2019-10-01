import {
  Component,
  OnInit,
  ElementRef,
  Output,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DashboardConfigService } from '../dashboard-config.service';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';

@Component({
  selector: 'hyt-add-widget-dialog',
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.scss']
})
export class AddWidgetDialogComponent implements OnInit, OnDestroy {
  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() addWidgets: EventEmitter<any> = new EventEmitter();
  categorydWidgets: any = null;
  widgetCategoryList: any;
  widgetList: any;
  selectedWidgets: { id: number, name: string }[] = [];
  selectedCategory = null;
  widgetAddMax = 10;
  currentWidget;

  @Input() id: string;
  private element: any;

  constructor(
    private viewContainer: ElementRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dashboardConfigService: DashboardConfigService,
    private hytModalService: HytModalConfService
  ) {
    this.element = viewContainer.nativeElement;
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

  // open modal
  open(): void {
    this.element.style.display = 'block';
    document.body.classList.add('hyt-modal-open');

    // this.viewContainer.nativeElement.style.display = '';
    this.categorydWidgets = null;
    this.selectedWidgets = [];
    // get widget list
    this.dashboardConfigService.getWidgetList()
      .subscribe((wl: any[]) => {
        // set initial quantity
        wl.map((w) => w.count = 0);
        this.widgetList = wl;
        // get category list
        this.dashboardConfigService.getWidgetCategoryList()
          .subscribe((cl) => {
            this.widgetCategoryList = cl;
            this.onCategorySelect(this.widgetCategoryList[0]);
          });
      });
  }

  // close modal
  close(): void {
    this.element.style.display = 'none';
    document.body.classList.remove('hyt-modal-open');
  }

  /****************************************************************************************** */

  // close($event?) {
  //   this.router.navigate(
  //     ['/dashboards'],
  //     {relativeTo: this.activatedRoute}
  //   );
  //   this.modalClose.emit($event);
  // }

  dismiss(e: any) {
    if (e.target === this.viewContainer.nativeElement) {
      // this.close(e);
      this.close();
    }
  }

  confirm() {
    this.addWidgets.emit(this.selectedWidgets);
    this.close();
  }

  addWidget(widget) {
    if (widget.count < this.widgetAddMax) {
      widget.count++;
    }
    this.onWidgetChange(widget);
  }

  removeWidget(widget) {
    if (widget.count > 0) {
      widget.count--;
    }
    this.onWidgetChange(widget);
  }

  onWidgetChange(widget) {
    if (widget.count === 0 && this.selectedWidgets.includes(widget)) {
      // remove
      const index = this.selectedWidgets.indexOf(widget);
      this.selectedWidgets.splice(index, 1);
    } else if (widget.count > 0 && !this.selectedWidgets.includes(widget)) {
      // add
      this.selectedWidgets.push(widget);
    }
  }

  onCategorySelect(category: any) {
    this.selectedCategory = category;
    if (category.id === 0) {
      this.categorydWidgets = this.widgetList.slice();
      return;
    }
    this.categorydWidgets = this.widgetList.filter((w) => {
      return w.categoryId === category.id;
    });
  }

  onWidgetClick(widget: any) {
    // console.log(widget);
  }

  onRate(rating: any) {
    // console.log('onRate', rating);
  }
}
