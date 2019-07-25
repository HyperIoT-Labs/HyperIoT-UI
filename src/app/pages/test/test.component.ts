import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { HusersService, DataStreamService } from '@hyperiot/core'
import { CookieService } from 'ngx-cookie-service';
import { I18n } from '@ngx-translate/i18n-polyfill';


@Component({
  selector: 'hyt-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor(
    private ser: HusersService,
    private dataStreamService: DataStreamService,
    private cookie: CookieService,
    private i18n: I18n,
    @Inject(LOCALE_ID) public locale: string
  ) {
    console.log(locale)
  }

  widget = {
    id: 'my-widget-id',
    config: {
      data: [
        {
          name: '2018',
          x: [
            'gen',
            'feb',
            'mar',
            'apr',
            'mag',
            'giu',
            'lug',
            'ago',
            'set',
            'ott',
            'nov',
            'dic'
          ],
          y: [
            5.2,
            8.45,
            11.28,
            14.8,
            22.2,
            25.13,
            27.9,
            30.2,
            26.64,
            20.12,
            12.88,
            6.73
          ],
          type: 'bar'
        },
        {
          name: '2019',
          x: [
            'gen',
            'feb',
            'mar',
            'apr',
            'mag',
            'giu',
            'lug',
            'ago',
            'set',
            'ott',
            'nov',
            'dic'
          ],
          y: [
            7.2,
            10.45,
            13.28,
            16.8,
            24.2,
            27.13,
            29.9,
            32.2,
            28.64,
            22.12,
            14.88,
            8.73
          ],
          type: 'bar'
        }
      ],
      layout: {
        'title': {
          font: {
            size: 14,
            color: '#16A4FA'
          },
          xref: 'container',
          yref: 'container',
          x: 0,
          y: 1,
          pad: {
            t: 10,
            l: 10
          },
          text: 'Average temperature comparison by year'
        },
        xaxis: {
          tickangle: -45
        }
      }
    }
  }

  private encapsulationId: string;

  getAll() {
    console.log(this.cookie.getAll())
  }

  stringToTranslate: string = this.i18n('TEST_stringToTranslate');

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
    this.ser.findAllHUser().subscribe(
      res => console.log(res),
      err => console.log(err)
    )
  }

}
