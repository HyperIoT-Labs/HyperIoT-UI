import { Component, OnInit } from '@angular/core';
import { DashboardConfigService } from '../dashboard-config.service';
import { Dashboard } from 'core';

@Component({
  selector: 'hyperiot-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.css']
})
export class DashboardsListComponent implements OnInit {
  dashboardList: Dashboard[] = [];

  constructor(private configService: DashboardConfigService) { }

  ngOnInit() {
  }

}
