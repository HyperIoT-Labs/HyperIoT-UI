import {
  Component,
  OnInit,
  ElementRef,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DashboardConfigService } from '../dashboard-config.service';

@Component({
  selector: 'hyt-add-widget-dialog',
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.css']
})
export class AddWidgetDialogComponent implements OnInit {
  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() addWidgets: EventEmitter<any> = new EventEmitter();
  categorydWidgets: any = null;
  widgetCategoryList: any;
  widgetList: any;
  selectedWidgets: { id: number, name: string }[] = [];
  selectedCategory = null;
  widgetAddMax = 10;

  constructor(
    private viewContainer: ElementRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dashboardConfigService: DashboardConfigService
  ) { }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key.toUpperCase() === 'ESCAPE') {
      this.close(event);
    }
  }

  ngOnInit() {
    this.open();
  }

  open() {
    this.viewContainer.nativeElement.style.display = '';
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

  close($event?) {
    this.router.navigate(
      ['../', ''],
      {relativeTo: this.activatedRoute}
    );
    this.modalClose.emit($event);
  }

  dismiss(e: any) {
    if (e.target === this.viewContainer.nativeElement) {
      this.close(e);
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
}
