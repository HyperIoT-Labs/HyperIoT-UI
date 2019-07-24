import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'hyt-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  dashboardId: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      id => this.dashboardId = id.get('id')
    )
  }

  saveDashboard() {
    //this.dashboardLayout.saveDashboard();
  }
  addWidget() {
    //this.widgetDialog.open();
    // TODO: bind to "requestWidgetAdd" event
  }

}
