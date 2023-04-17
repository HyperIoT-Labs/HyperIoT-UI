import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { WidgetsService } from 'core';
import { KeyValue } from '@angular/common';
import { HytModal, HytModalService } from 'components';
import { WidgetSelection } from '../model/dashboard.model';

@Component({
  selector: 'hyperiot-add-widget-dialog',
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddWidgetDialogComponent extends HytModal implements OnInit {

  ratingTotalStars = 5;
  filteredWidgets: WidgetSelection[] = [];
  widgetCategoryList: any;
  widgetList: WidgetSelection[] = [];
  selectedWidgets: WidgetSelection[] = [];
  selectedCategory = null;
  widgetAddMax = 10;
  currentWidget: WidgetSelection;

  dialogDataState = 0;

  os = '';
  mac = false;
  linux = false;

  constructor(
    hytModalService: HytModalService,
    private widgetsService: WidgetsService
  ) {
    super(hytModalService);
  }

  widgetsByCategory: any;

  // open modal
  ngOnInit() {
    this.dialogDataState = 0;
    //    super.open();

    this.os = navigator.platform;

    const lowOS = this.os.toLocaleLowerCase();

    if (lowOS.includes('mac')) {
      this.mac = true;
    } else if (lowOS.includes('linux')) {
      this.linux = true;
    }

    this.dialogDataState = 0;
    this.currentWidget = null;
    this.widgetCategoryList = [];
    this.widgetsByCategory = [];
    this.selectedWidgets = [];
    this.widgetList = [];

    this.widgetsService.findAllWidgetInCategories(this.data.signalIsOn ? 'realTime' : 'offline').subscribe(
      res => {
        this.widgetCategoryList = res.catInfo;
        this.widgetsByCategory = res.widgetMap;
        for (const key in this.widgetsByCategory) {
          if (this.widgetsByCategory[key]) {
            for (const el of this.widgetsByCategory[key]) {
              el.count = 0;
              this.widgetList.push(el);
            }
          }
        }
        this.onCategorySelect(this.widgetCategoryList.ALL);
        this.dialogDataState = 1;

      },
      error => {
        this.dialogDataState = -1;
      });
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
    // const widgetOutput = [];
    // this.selectedWidgets.forEach(w => {
      // if (w.type === 'offline-table' || w.type === 'event-offline-table' || w.type === 'error-table') {
        //w.baseConfig = { online: this.data.signalIsOn }; TODO
      // }
      // widgetOutput.push();
    // });
    this.close(this.selectedWidgets);
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


  onWidgetChange(widgetSelection: WidgetSelection) {
    if (widgetSelection.count === 0 && this.selectedWidgets.includes(widgetSelection)) {
      // remove
      const index = this.selectedWidgets.indexOf(widgetSelection);
      this.selectedWidgets.splice(index, 1);
    } else if (widgetSelection.count > 0 && !this.selectedWidgets.includes(widgetSelection)) {
      // add
      this.selectedWidgets.push(widgetSelection);
    }
  }

  onCategorySelect(category: any) {
    if (category.name === 'all') {
      this.filteredWidgets = [...this.widgetList];
    } else {
      this.filteredWidgets = this.widgetList.filter((w) => w.widgetCategory['name'] === category.name);
    }
    this.selectedCategory = category;
  }

  onRate(rating: any) {
    this.widgetsService.rateWidget(
      rating.newValue,
      { id: this.currentWidget.id, entityVersion: this.currentWidget.entityVersion }
    ).subscribe();
  }

  orderById(akv: KeyValue<string, any>, bkv: KeyValue<string, any>): number {
    const a = akv.value.index;
    const b = bkv.value.index;
    return a > b ? 1 : (b > a ? -1 : 0);
  }

  convertBase64 = payload => atob(payload);

}
