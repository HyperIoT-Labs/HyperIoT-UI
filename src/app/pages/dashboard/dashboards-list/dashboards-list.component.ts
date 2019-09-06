import { Component, OnInit } from '@angular/core';
import { DashboardConfigService } from '../dashboard-config.service';
import { Dashboard } from '@hyperiot/core';
import { MyTel } from 'src/app/test/my-tel-input/my-tel-input.component';

@Component({
  selector: 'hyt-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.css']
})
export class DashboardsListComponent implements OnInit {
  dashboardList: Dashboard[] = [];

  // just for testint mat custom form control
  number: MyTel = {
    area: '',
    exchange: '',
    subscriber: ''
  };

  constructor(private configService: DashboardConfigService) { }

  ngOnInit() {
    this.configService
        .getDashboardList()
        .subscribe((list) => this.dashboardList = list);
  }

}
