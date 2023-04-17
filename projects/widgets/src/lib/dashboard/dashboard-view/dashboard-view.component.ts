import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Dashboard } from 'core';
import { WidgetSelection } from '../model/dashboard.model';

@Component({
  selector: 'hyperiot-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.css']
})
export class DashboardViewComponent implements OnInit {
  @ViewChild('WidgetsDashboardLayoutComponent') dashboardLayout;

  @Input() dashboard: Dashboard;
  @Input() dashboardType: any;
  @Input() dashboardWidgets;

  @Output() dashboardViewEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() dsTopologyResTimeChange: EventEmitter<any> = new EventEmitter<any>();

  bool = false;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private router: Router
  ) { }

  ngOnInit() { }

  onAddingWidgets(event) {
    this.onWidgetsAdd(event);
    // console.log("adding widgets",event)
    // event.addWidgets
    // .pipe(takeUntil(this.ngUnsubscribe))
    // .subscribe(
    //   (widgets) => {this.onWidgetsAdd(widgets)}
    // );
  }

  saveDashboard() {
    this.dashboardLayout.saveDashboard();
  }

  onWidgetsAdd(widgetList: WidgetSelection[]) {
    widgetList.forEach((widget) => {
      this.dashboardLayout.addItem(widget);
    });
  }

}
