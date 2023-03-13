import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ServicesService } from '@hyperiot/core';
import { map, PartialObserver } from 'rxjs';

@Component({
  selector: 'hyt-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  feVersion = environment.version;
  beVersion = '';
  beVersionPending = true;

  beVersionObserver: PartialObserver<any> = {
    next: res => {
      this.beVersion = res.version;
      this.beVersionPending = false;
    },
    error: err => {
      this.beVersion = 'ERR';
      this.beVersionPending = false;
    }
  }

  constructor(
    private servicesService: ServicesService
  ) { }

  ngOnInit(): void {
    this.servicesService.getHyperIoTServicesVersions().subscribe(this.beVersionObserver);
  }

}
