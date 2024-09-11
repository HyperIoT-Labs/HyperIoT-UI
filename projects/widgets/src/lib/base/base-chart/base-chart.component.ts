import { Directive, Injector, Optional } from '@angular/core';

import { PlotlyService } from 'angular-plotly.js';
import { TimeSeries } from '../../data/time-series';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { LoggerService } from 'core';
import { ServiceType } from '../../service/model/service-type';

@Directive()
export abstract class BaseChartComponent extends BaseWidgetComponent {

  chartData: TimeSeries[] = [];

  layout = {
    autosize: true,
    margin: {
      l: 80,
      r: 80,
      t: 10,
      b: 10,
      pad: 2,
      autoexpand: true
    },
    pad: {
      b: 50
    },
    font: {
      size: 9
    },
    xaxis: {
      autorange: true,
      automargin: true,
      tickangle: -45,
      showgrid: true,
      showline: true
    },
    yaxis: {
      autorange: true,
      automargin: true,
      showline: true,
      zeroline: false,
      visible: true
    },
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1
    }
  };

  graph: any = {};


  private relayoutTimeout = null;
  private relayoutTimestamp;
  public isPaused: boolean;

  public defaultSeriesConfig = {
    type: 'scatter',
    mode: 'lines',
    line: { simplify: false, width: 2, smoothing: 1.3 },
    connectgaps: true
  };

  constructor(
    injector: Injector,
    @Optional() public plotly: PlotlyService = new PlotlyService(),
    protected loggerService: LoggerService
  ) {
    super(injector, loggerService);
  }

  onToolbarAction(action: string) {
    super.onToolbarAction(action);
  }

  configure(): void {
    this.widgetAction.emit({ widget: this.widget, action: 'widget:ready' });
  }

  /**
   * Adds new data to a time series.
   *
   * @param series The series to add data to
   * @param x The x value (Date)
   * @param y The y value (number)
   */
  bufferMutipleData(series: TimeSeries, xValues: Date[], yValues: number[]): void {
    // NOTE: `series` is just a local copy of chart data,
    // NOTE: the real data is stored in the plotly graph object
    for (let i = 0; i < xValues.length; i++){
      series.x.push(xValues[i]);
      series.y.push(yValues[i]);
    }
    series.lastBufferIndexUpdated += xValues.length;
  }

  /**
   * Render all series inside a chart
   * series
   * Plotly
   * graph
   */
  renderAllSeriesData(series: TimeSeries[], plotly, graph, isPaused = false){
    // console.log('renderAllSeriesData');
    for (let s = 0; s < series.length; s++) {
      const serieIndex = s;
      const bufferedSerie = series[s];
      this.renderSeriesData(bufferedSerie, serieIndex, plotly, graph, isPaused);
    }
  }

  /**
   * Render single serie
   * series
   * serieIndex
   * Plotly
   * graph
   */
  renderSeriesData(series: TimeSeries, serieIndex, plotly, graph, isPaused = false): void{
    // console.log('Component|widget-chart|renderSeriesData|: ', this.data, `widget-${this.widget.id}`, isPaused);
    // console.log(series);
    if (!isPaused){
      // keeps data length < this.maxDataPoints
      if (this.serviceType !== ServiceType.OFFLINE) {
        this.applySizeConstraints(series);
      }
      // reset x axis range to default
      // this.requestRelayout(series.x[series.x.length - 1], graph);
      // updating only if there's data
      if (series.x.length > 0 && series.y.length > 0){
        const xValues: Date[] = series.x.splice(0, series.lastBufferIndexUpdated);
        const yValues: number[] = series.y.splice(0, series.lastBufferIndexUpdated);
        if (this.widget.config.maxDataPoints > 0){
          plotly?.extendTraces(graph, {
            x: [xValues],
            y: [yValues]
          }, [serieIndex], this.widget.config.maxDataPoints);
        } else {
          plotly?.extendTraces(graph, {
            x: [xValues],
            y: [yValues]
          }, [serieIndex]);
        }
      }
    }
  }

  applyStoredConfig(timeSeriesData: any) {
    const config = this.widget.config;
    if (this.layout != null) {
      Object.assign(this.graph.layout, this.layout);
    }
    const sc = config.seriesConfig.find((cfg) => cfg.series === timeSeriesData.name);
    if (sc != null) {
      Object.assign(timeSeriesData, sc.config);
    }
  }

  // Private methods

  private requestRelayout(lastEventDate: Date, graph) {
    this.relayoutTimestamp = lastEventDate;
    if (this.relayoutTimeout === null) {
      this.relayoutTimeout = setTimeout(() => {
        this.relayoutTimeout = null;
        this.relayout(this.relayoutTimestamp, graph);
      }, 100);
    }
  }
  private async relayout(lastEventDate: Date, graph) {
    if (lastEventDate === undefined || lastEventDate == null) { return; }
    // set x range to the last 30 seconds of data
    const rangeEnd = new Date(lastEventDate);
    console.log(this.widget.config.timeAxisRange)
    const rangeStart = new Date(rangeEnd.getTime() - (1 * this.widget.config.timeAxisRange * 1000));
    // relayout x-axis range with new data
/*
    if (this.data === 'modal') {
      Plotly = this.plotlyModal.getPlotly();
    } else {
*/
    const plotly = await this.plotly.getPlotly();
    // }

    // const graph = this.plotly.getInstanceByDivId(`widget-${this.widget.id}`);
    if (graph) {    
      plotly.relayout(graph, {
        'xaxis.range': [rangeStart, rangeEnd],
        'xaxis.domain': [0.125, 1 - (0.075) * (this.graph.data.length - 1)]
      });
    }
  }

  private applySizeConstraints(data: TimeSeries) {
    const cfg = this.widget.config;
    if (data.x.length > cfg.maxDataPoints && cfg.maxDataPoints > 0) {
      data.x.splice(0, data.x.length - cfg.maxDataPoints);
      data.y.splice(0, data.y.length - cfg.maxDataPoints);
      data.lastBufferIndexUpdated = 0;
    }
    if (data.x.length > 0){
      const endDate = data.x[data.x.length - 1].getTime();
      while (
        cfg.timeWindow > 0 &&
        data.x.length > 0 &&
        (endDate - data.x[0].getTime()) / 1000 > cfg.timeWindow
        ) {
        data.x.shift();
        data.y.shift();
      }
    }
  }

}
