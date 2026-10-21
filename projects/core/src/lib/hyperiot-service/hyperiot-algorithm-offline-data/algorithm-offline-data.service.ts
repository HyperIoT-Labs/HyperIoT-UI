import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {HProjectAlgorithmsService} from '../../hyperiot-client/hyt-api/api-module';

interface WidgetAlgorithm {
  hProjectAlgorithmId: number;
  widgetId: number;
}

/**
 * Time range selected on the dashboard timeline (epoch millis)
 */
export interface AlgorithmTimeRange {
  startTime: number;
  endTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlgorithmOfflineDataService {

  private subscriptions: WidgetAlgorithm[] = [];

  private hProjectId: number;

  public totalDataCount = [];

  /**
   * Emits the range selected on the dashboard timeline, null when no range is selected
   */
  public timeRange$ = new BehaviorSubject<AlgorithmTimeRange | null>(null);

  constructor(
    private hprojectAlgorithmsService: HProjectAlgorithmsService
  ) { }

  public resetService(hProjectId: number): void {
    this.hProjectId = hProjectId;
    this.subscriptions = [];
    this.timeRange$.next(null);
  }

  setTimeRange(startTime: number, endTime: number) {
    this.timeRange$.next({ startTime, endTime });
  }

  clearTimeRange() {
    this.timeRange$.next(null);
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

  getDataInRange(hProjectAlgorithmId: number, range: AlgorithmTimeRange) {
    return this.hprojectAlgorithmsService.getAlgorithmOutputs1(this.hProjectId, hProjectAlgorithmId, range.startTime, range.endTime);
  }

}
