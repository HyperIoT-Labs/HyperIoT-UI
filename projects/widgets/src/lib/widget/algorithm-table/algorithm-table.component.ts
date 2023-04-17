import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AlgorithmOfflineDataService, LoggerService, PacketData } from 'core';
import * as moment_ from 'moment';
import { Subject, Subscription } from 'rxjs';
import { BaseTableComponent } from '../../base/base-table/base-table.component';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

const moment = moment_;

@Component({
  selector: 'hyperiot-algorithm-table',
  templateUrl: './algorithm-table.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './algorithm-table.component.css']
})
export class AlgorithmTableComponent extends BaseTableComponent implements AfterViewInit, OnInit {

  readonly REFRESH_RATE = 60 * 60 * 1000; // one hour

  @ViewChild('tableChild', { static: false }) tableChild;

  hProjectAlgorithmId: number;

  allData: PacketData[] = [];

  tableHeaders = [];
  tableSource: Subject<any[]> = new Subject<any[]>();

  dataRequest: Subscription;

  constructor(
    private algorithmOfflineDataServices: AlgorithmOfflineDataService,
    injector: Injector,
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
  }

  ngAfterViewInit() {
    // TODO 500 ms?
    setTimeout(() => this.configure(), 500);
  }

  configure(): void {

    super.configure();

    if (
      !(
        this.widget.config != null &&
        this.widget.config.hProjectAlgorithmId != null &&
        this.widget.config.outputFields != null &&
        this.widget.config.outputFields.length > 0
      )
    ) {
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;

    // Set header
    const outputFields: string[] = this.widget.config.outputFields;
    if (outputFields.length > 0) {
      this.tableHeaders = outputFields.map(outputField => ({ value: outputField }));
    }

    // set data source
    this.setDatasource();

  }

  private setDatasource(): void {
    if (this.hProjectAlgorithmId !== this.widget.config.hProjectAlgorithmId) {
      if (this.hProjectAlgorithmId) {
        this.algorithmOfflineDataServices.removeWidget(this.widget.id, this.hProjectAlgorithmId);
      }
      this.hProjectAlgorithmId = this.widget.config.hProjectAlgorithmId;
      this.algorithmOfflineDataServices.addWidget(this.widget.id, this.hProjectAlgorithmId);
      this.widgetAction.emit({ widget: this.widget, action: 'widget:ready'});
    }
    setTimeout(() => {
      // first load
      this.getAlgorithmData();
    }, 0);
    setInterval(() => {
      // load updated data
      this.getAlgorithmData();
    }, this.REFRESH_RATE);
  }

  onToolbarAction(action: string) {
    const widgetAction: WidgetAction = { widget: this.widget, action };
    switch (action) {
      case 'toolbar:fullscreen':
        widgetAction.value = this.allData;
        break;
    }
    this.widgetAction.emit(widgetAction);
  }

  getDatum(array, name) {
    return array.some(y => y.name === name) ? array.find(y => y.name === name).value : '-';
  }

  getAlgorithmData() {
    if (this.dataRequest) {
      this.dataRequest.unsubscribe();
    }
    this.dataRequest = this.algorithmOfflineDataServices.getData(this.hProjectAlgorithmId).subscribe(
      res => {
        if (Object.keys(res.rows).length > 0) {
          const pageData = [];
          const rowKey = Object.keys(res.rows)[0];  // take only first value
          const value = res.rows[rowKey].value;
          const millis = +value.timestamp * 1000;
          value.timestamp = moment(millis).format('L') + ' ' + moment(millis).format('LTS');
          this.tableHeaders = Object.keys(value).map(k => ({ value: k }));
          pageData.push(value);
          this.tableSource.next(pageData);
        } else {
          this.tableChild.resetTable();
        }
      }
    );
  }
}
