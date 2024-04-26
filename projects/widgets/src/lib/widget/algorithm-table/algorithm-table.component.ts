import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AlgorithmOfflineDataService, HpacketsService, LoggerService, PacketData } from 'core';
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

  hPacketIdMap : Map<number, string> = new Map()

  constructor(
    private algorithmOfflineDataServices: AlgorithmOfflineDataService,
    injector: Injector,
    protected loggerService: LoggerService,
    private packetService: HpacketsService,
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
        this.widget.config.packetFields != null &&
        Object.keys(this.widget.config.packetFields).length > 0
      )
    ) {
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;

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
    this.tableChild.resetTable();
    if (this.dataRequest) {
      this.dataRequest.unsubscribe();
    }
    this.dataRequest = this.algorithmOfflineDataServices.getData(this.hProjectAlgorithmId).subscribe(
      async res => {

        if (Object.keys(res.rows).length > 0) {
          const pageData = [];
          const rowKey = Object.keys(res.rows)[0];  // take only first value
          const value = res.rows[rowKey].value;

          // TO DO: effetturare questa operazione sul solo campo output (?)
          //this.computePacketData([value]);

          // Compute timeStamp
          const millis = +value.timestamp * 1000;
          let valueTimestamp = moment(millis).format('L') + ' ' + moment(millis).format('LTS');

          // Create HEADERS of tables based on results
          let jsonObject = JSON.parse(value.output);
          let keys = Object.keys(jsonObject.results[0].grouping); // Extract grouping keys
          this.hPacketIdMap = await this.setHeadersTable(keys); 

          // Add one row for each result rows
          jsonObject.results.forEach((el) => {
            this.addData(el, valueTimestamp, this.hPacketIdMap, pageData);
          });

          //Lastly, add results to page
          this.tableSource.next(pageData);

        } else {
          this.tableChild.resetTable();
        }
      }
    );
  }

  async setHeadersTable(groupingKeys: any) {
    try {
        const fieldIds = Object.keys(this.widget.config?.packetFields) || [];
        this.tableHeaders = fieldIds.map(hPacketFieldId => ({
            value: this.widget.config.packetFields[hPacketFieldId],
            label: this.widget.config.fieldAliases[hPacketFieldId] || this.widget.config.packetFields[hPacketFieldId],
            type: this.widget.config.fieldTypes[hPacketFieldId],
        }));

        if (groupingKeys.length > 0 && this.hPacketIdMap.size == 0) {
            const res = await this.packetService.getHPacketField(groupingKeys).toPromise();
            res.forEach(element => {
                this.hPacketIdMap.set(element.id, element.name);
            });

            for (let i = 0; i < groupingKeys.length; i++) {
                let key = Number(groupingKeys[i]);
                let groupingName = this.hPacketIdMap.get(key);
                this.tableHeaders.unshift({
                    value: groupingName,
                    label: groupingName,
                    type: 'DOUBLE'
                });
            }
        }

        // Infine, aggiungi la colonna timestamp
        this.tableHeaders.push({
            value: 'timestamp',
            label: this.widget.config.timestampFieldName,
            type: 'DATE'
        });

        return this.hPacketIdMap;
    } catch (error) {
        this.logger.error('Si è verificato un errore:', error);
        throw error;
    }
  }


  addData(el, valueTimestamp, map, pageData) {
    let obj: any = { "output": el.output, "timestamp": valueTimestamp };
    if (el.grouping && Object.keys(el.grouping).length > 0) {

      Object.keys(el.grouping).forEach((key) => {      
        let k = map.get(Number(key));
        let v = el.grouping[key];
        obj[k] = v;
      });
    }
    pageData.unshift(obj);
    return pageData
  }

}
