import { Component, OnInit } from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {Area, AreasService} from '@hyperiot/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'hyt-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit {
  idProjectSelected = 0;
  showAreas = false;
  areaId = 0
  areaPath: any[] = [];

  constructor(
    private cookieService: CookieService,
    private areaService: AreasService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
/*    const user = JSON.parse(this.cookieService.get('user'));
    this.idProjectSelected = user?.id === 502 ? 503 : 425;
    console.log(user);*/
    // this.idProjectSelected = 425;

    this.showAreas = this.activatedRoute.snapshot.routeConfig.path.startsWith('areas/');

    if (this.showAreas) {
      // load area realtime Dashboard
      this.areaId = +this.activatedRoute.snapshot.params.areaId;
      this.idProjectSelected = +this.activatedRoute.snapshot.params.projectId;
      if (this.areaId) {
        this.areaService.getAreaPath(this.areaId).subscribe((areas: Area[]) => {
          this.areaPath = areas;
        });
      }
    }

  }

}
