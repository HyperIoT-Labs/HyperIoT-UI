import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { ActivatedRoute, Router, OutletContext } from '@angular/router';

import { WidgetsLayoutComponent } from '../widgets-layout/widgets-layout.component';
import { AddWidgetDialogComponent } from '../add-widget-dialog/add-widget-dialog.component';
import { WidgetSettingsDialogComponent } from '../widget-settings-dialog/widget-settings-dialog.component';
import { DashboardConfigService } from '../dashboard-config.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';

@Component({
  selector: 'hyt-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.css']
})
export class DashboardViewComponent implements OnInit {
  @ViewChild(WidgetsLayoutComponent, { static: false })
  dashboardLayout: WidgetsLayoutComponent;
  
  @Input() dashboardId: string;
  @Input() dashboardType: any;
  @Input() dashboardWidgets;

  bool: boolean = false;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private hytModalService: HytModalConfService
  ) { }

  ngOnInit() {}

  onAddingWidgets(event) {
    this.onWidgetsAdd(event)
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

  onWidgetsAdd(widgetList: any[]) {
    widgetList.map((widget) => {
      this.dashboardLayout.addItem(widget);
    });
  }
}
