import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataStreamService } from '@hyperiot/core';
import { WidgetsLayoutComponent } from './widgets-layout/widgets-layout.component';

@Component({
  selector: 'hyt-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // dashboardId: string;
  // private dashboardLayout: WidgetsLayoutComponent;

  // constructor(private route: ActivatedRoute, private dataStreamService: DataStreamService) { }

  ngOnInit() {
    // this.route.paramMap.subscribe(
    //   id => this.dashboardId = id.get('id')
    // )
  }

  // saveDashboard() {
  //   this.dashboardLayout.saveDashboard();
  // }
  // addWidget() {
  //   this.widgetDialog.open();
  //   // TODO: bind to "requestWidgetAdd" event
  // }

  // click() {
  //   this.dataStreamService.eventStream.subscribe((event) => {
  //     console.log(event.data)
  //   })

  //   this.dataStreamService.connect();
  // }

}
