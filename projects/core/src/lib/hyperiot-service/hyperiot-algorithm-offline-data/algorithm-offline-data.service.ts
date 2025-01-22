import { Injectable } from '@angular/core';
import {HProjectAlgorithmsService} from '../../hyperiot-client/hyt-api/api-module';

interface WidgetAlgorithm {
  hProjectAlgorithmId: number;
  widgetId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlgorithmOfflineDataService {

  private subscriptions: WidgetAlgorithm[] = [];

  private hProjectId: number;

  public totalDataCount = [];

  constructor(
    private hprojectAlgorithmsService: HProjectAlgorithmsService
  ) { }

  public resetService(hProjectId: number): void {
    this.hProjectId = hProjectId;
    this.subscriptions = [];
  }

  addWidget(widgetId: number, hProjectAlgorithmId: number) {
    if (!this.subscriptions.some(x => x.widgetId === widgetId)) {
      this.subscriptions.push({ widgetId: widgetId, hProjectAlgorithmId: hProjectAlgorithmId });
    }
  }

  removeWidget(widgetId: number, hProjectAlgorithmId: number) {
    this.subscriptions = this.subscriptions.filter(y => y.widgetId !== widgetId);
  }

  getData(hProjectAlgorithmId: number) {
    return this.hprojectAlgorithmsService.getAlgorithmOutputs(this.hProjectId, hProjectAlgorithmId);
  }

}
