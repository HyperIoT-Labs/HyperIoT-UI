import { Component, OnInit } from '@angular/core';
import { HusersService, DataStreamService } from '@hyperiot/core'
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'hyt-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor(private ser: HusersService, private dataStreamService: DataStreamService, private cookie: CookieService) { }

  private encapsulationId: string;

  getAll() {
    console.log(this.cookie.getAll())
  }

  buttonClick() {
    this.dataStreamService.eventStream.subscribe((event) => {
      console.log(event.data)
    })

    this.dataStreamService.connect();


    //
    //let packet = JSON.parse(event.data);
    //console.log(packet);
    // // packet = JSON.parse(packet.payload);
    // const rowHtml = `
    //   <div ${this.encapsulationId} class="time">
    //     ${new Date().toLocaleTimeString()}
    //   </div>
    //   <div ${this.encapsulationId} class="message">
    //     ${packet.payload}
    //   </div>
    //   <div ${this.encapsulationId} class="extra">
    //     ---
    //   </div>
    // `;
    // // limit max log lines
    // let maxLogLines = 100;
    // if (this.widget.config && this.widget.config.maxLogLines) {
    //   maxLogLines = +this.widget.config.maxLogLines;
    // }
    // const logdiv = this.log.nativeElement;
    // while (logdiv.childNodes.length / 3 > maxLogLines) {
    //   const logLine = logdiv.childNodes[logdiv.childNodes.length - 1];
    //   logdiv.removeChild(logLine);
    // }
    // this.log.nativeElement
    //   .insertAdjacentHTML('afterbegin', rowHtml);
    //});

  }

  ngOnInit() {

  }

  click() {
    this.ser.findAllHUser_1().subscribe(
      res => console.log(res),
      err => console.log(err)
    )
  }

}
