import { Component, OnInit, ElementRef, Output, EventEmitter, HostListener, Input, OnDestroy } from '@angular/core';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { WidgetsService, Widget } from '@hyperiot/core';
import { KeyValue } from '@angular/common';

interface WidgetClient {
  id?: number;
  entityVersion: number;
  categoryIds?: Array<number>;
  tagIds?: Array<number>;
  name?: string;
  description?: string;
  widgetCategory?: Widget.WidgetCategoryEnum;
  domains?: Array<Widget.DomainsEnum>;
  baseConfig?: string;
  type?: string;
  cols?: number;
  rows?: number;
  image?: string;
  preView?: string;
  avgRating?: number;
  count: number;
}

@Component({
  selector: 'hyt-add-widget-dialog',
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.scss']
})
export class AddWidgetDialogComponent implements OnInit, OnDestroy {
  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() addWidgets: EventEmitter<any> = new EventEmitter();
  filteredWidgets: WidgetClient[] = [];
  widgetCategoryList: any;
  widgetList: WidgetClient[] = [];
  selectedWidgets: WidgetClient[] = [];
  selectedCategory = null;
  widgetAddMax = 10;
  currentWidget: WidgetClient;

  @Input() id: string;
  private element: any;

  dialogDataState = 0;

  constructor(
    private viewContainer: ElementRef,
    private hytModalService: HytModalConfService,
    private widgetsService: WidgetsService
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

  widgetsByCategory: any;

  // open modal
  open(): void {
    this.dialogDataState = 0,
    this.element.classList.add('open');
    document.body.classList.add('hyt-modal-open');

    this.dialogDataState = 0;
    this.currentWidget = null;
    this.widgetCategoryList = [];
    this.widgetsByCategory = [];
    this.selectedWidgets = [];
    this.widgetList = [];

    this.widgetsService.findAllWidgetInCategories().subscribe(
      res => {
        this.widgetCategoryList = res['catInfo'];
        this.widgetsByCategory = res['widgetMap'];
        for (var key in this.widgetsByCategory) {
          for (let el of this.widgetsByCategory[key]) {
            this.widgetList.push({
              id: el.id,
              entityVersion: el.entityVersion,
              count: 0,
              name: el.name,
              description: el.description,
              cols: el.cols,
              rows: el.rows,
              type: el.type,
              image: 'data:image/jpeg;base64,' + atob(el.image),
              preView: 'data:image/jpeg;base64,' + atob(el.preView),
              avgRating: el.avgRating,
              widgetCategory: el.widgetCategory
            })
          }

        }
        this.onCategorySelect(this.widgetCategoryList['ALL']);
        this.dialogDataState = 1;
      },
      error => {
        this.dialogDataState = -1;
      });

  }

  // close modal
  close(): void {
    this.element.classList.remove('open');
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

  // dismiss(e: any) {
  //   if (e.target === this.viewContainer.nativeElement) {
  //     // this.close(e);
  //     this.close();
  //   }
  // }

  confirm() {
    let widgetOutput: any[] = [];
    this.selectedWidgets.forEach(w=>widgetOutput.push({
      count: w.count,
      x: 0,
      y: 0,
      type: w.type,
      cols: w.cols,
      rows: w.rows,
      name: w.name,
      dataUrl: '',
      dataTableUrl: '',
      config: w.baseConfig
    }))
    this.addWidgets.emit(widgetOutput);
    this.close();
  }

  // addWidget(widget) {
  //   if (widget.count < this.widgetAddMax) {
  //     widget.count++;
  //   }
  //   this.onWidgetChange(widget);
  // }

  // removeWidget(widget) {
  //   if (widget.count > 0) {
  //     widget.count--;
  //   }
  //   this.onWidgetChange(widget);
  // }


  onWidgetChange(widget: WidgetClient) {
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
    if (category.name == 'all')
      this.filteredWidgets = [...this.widgetList];
    else
      this.filteredWidgets = this.widgetList.filter((w) => w.widgetCategory['name'] == category['name']);
    this.selectedCategory = category;
  }

  onRate(rating: any) {
    this.widgetsService.rateWidget(rating.newValue, { id: this.currentWidget.id, entityVersion: this.currentWidget.entityVersion }).subscribe();
  }

  orderById(akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number {
    const a = akv.value.index;
    const b = bkv.value.index;
    return a > b ? 1 : (b > a ? -1 : 0);
  }

}
