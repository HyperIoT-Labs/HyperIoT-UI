import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { TimeStep } from 'components';
import * as d3 from 'd3';
import * as moment_ from 'moment';
import { HYTData } from "../models/timeline.model";
import { DashboardEventService } from '../../services/dashboard-event.service';
import { DashboardEvent } from '../../services/dashboard-event.model';
import { DialogService } from 'components';

const moment = moment_;
const animation = false;

// ! IMPORTANT
// TODO ResizeSensor after dashboard style fix. import { ResizeSensor } from 'css-element-queries';

/**
 * TimeAxisComponent is an HyperIoT component. It is used by TimelineComponent.
 * It is used to build the timeline through D3.
 */
@Component({
  selector: 'hyperiot-time-axis',
  templateUrl: './time-axis.component.html',
  styleUrls: ['./time-axis.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeAxisComponent implements AfterViewInit {

  constructor(
    private dashboardEvent: DashboardEventService,
  ) { }
  /**
   * timeStepMap is used to convert a step to a d3 TimeInterval
   */
  timeStepMap = {
    year: d3.timeYear,
    month: d3.timeMonth,
    day: d3.timeDay,
    hour: d3.timeHour,
    minute: d3.timeMinute,
    second: d3.timeSecond,
    millisecond: d3.timeMillisecond
  };

  /**
   * axis is the div that will be used by d3 to append the timeline svg element
   */
  @ViewChild('axis') axis: ElementRef;

  /**
   * dataTimeSelectionChanged is uset to emits an event when the user makes a time selection. It emits the timeSelection
   */
  @Output() dataTimeSelectionChanged = new EventEmitter();

  /**
   * dataTimeSelectionChanged is uset to emits an event when the user click a cube to zoom on it. It emits the the time start of
   * the selected cube
   */
  @Output() domainSet: EventEmitter<Date> = new EventEmitter<Date>();

  /**
   * data stores the timeline data that will be shown in the timeline
   */
  data: HYTData[] = [];

  /**
   * svg stores the svg element used by d3 to build the the timeline
   * It is the container of all the timeline components
   */
  svg;

  /**
   * The selection in dates
   */
  timeInterval = [];

  /**
   * The selection in pixels
   */
  selectionPx = [null, null];

  /**
   * The axis domain
   */
  domain: (number | Date)[] = [0, 0];
  /**
   * The timeline margin
   */
  margin = { top: 5, right: 20, bottom: 20, left: 20 };

  /**
   * The axis scale
   */
  axisScale: d3.ScaleTime<number, number>;

  /**
   * dataIntensityScale is use to color the cube depending on the cube data intensity
   */
  dataIntensityScale = d3.interpolate('#bababa', '#003cff');

  /**
   * The axis svg appended on svg
   */
  svgAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  /**
   * The current step in d3 timeInterval format
   */
  axisInterval: d3.CountableTimeInterval = d3.timeHour;

  /**
   * Selection brush property: Handle radius (w and e)
   */
  handleRadius = { w: 4, e: 4 };

  /**
   * Selection brush property: Brush area (width and height)
   */
  brushArea = { w: -1, h: 10 };

  /**
   * Transition property (duration and type)
   */
  transition = { duration: 1000, type: '' };

  /**
   * maxValue is the current maxValue of data in a singleStep. It is used to color the cube depending on data intensity
   */
  maxValue = 1;

  /**
   * The timeline chart width
   */
  contentWidth;

  /**
   * The timeline chart height
   */
  contentHeight;

  /**
   * stepInDomain is used to get the number of step in the domain
   */
  stepInDomain = {
    year: 1,
    month: 12,
    day: moment(this.domain[0]).daysInMonth(),
    hour: 24,
    minute: 60,
    second: 60
  };

  /**
   * Brush Property: rect is the selection
   */
  rect;

  /**
   * Brush Property: container is the brush container
   */
  container;

  /**
   * Brush Property: selectionSvg is the effective svg selection
   */
  selectionSvg;

  /**
   * Brush Property: selectionRenderSvg is the rendered svg selection
   */
  selectionRenderSvg;

  /**
   * Brush Property: rightHandle is the e handle
   */
  rightHandle;

  /**
   * Brush Property: leftHandle is the w handle
   */
  leftHandle;

  /**
   * Variable used to monitoring buttons to reset timeline selection and to emit current selection
   */
  @ViewChild('controlButtons') controlButtons: ElementRef;

  /**
   * Variable used to monitoring text used as a timeline tip
   */
  @ViewChild('selectionInitialTip') selectionInitialTip: ElementRef;

  /**
   * A callback method that is invoked immediately after Angular has completed initialization of a component's view.
   * It is used to build the timeline chart
   */
  ngAfterViewInit() {
    this.buildAxis();
  }

  private get defaultExportInterval() : Date[]{
    const today = moment();
    const yesterday = today.clone().subtract(1, 'days');
    return [yesterday.toDate(), today.toDate()];
  }

  /**
   * Defintion of brushed function
   */
  brushed = () => {
    const selection = d3.event.detail.selection;
    const mode = d3.event.detail.mode;

    if (selection) {
      if (mode !== 'code') {
        this.timeInterval = selection.map(d => this.axisInterval.round(this.axisScale.invert(d)));
        this.dashboardEvent.selectedDateIntervalForExport.next(this.defaultExportInterval);
      }
      if (mode === 'code-released') {
        this.dashboardEvent.timelineEvent.next(DashboardEvent.Timeline.NEW_RANGE);
        this.dashboardEvent.selectedDateIntervalForExport.next(this.defaultExportInterval);
        this.dataTimeSelectionChanged.emit(this.timeInterval);
      }
      this.rect?.attr('fill', (d) =>
        d.timestamp >= this.timeInterval[0] && d.timestamp < this.timeInterval[1] ?
          '#35d443' :
          this.setCubeIntensitiScale(d.value, this.maxValue)
      );
    } else {
      this.rect?.attr('fill', d => this.setCubeIntensitiScale(d.value, this.maxValue));
    }
  }

  /**
   * Defintion of brushReleased function
   */
  brushReleased = () => {
    const selection = d3.event.detail.selection;
    this.timeInterval = selection.map(d => this.axisInterval.round(this.axisScale.invert(d)));
    if (this.timeInterval[1] > this.timeInterval[0]) {
      this.dashboardEvent.selectedDateIntervalForExport.next(this.timeInterval);
      this.setSelection(
        this.timeInterval.map(this.axisScale),
        d3.select('#brush-group'),
        { type: 'brush', mode: 'code-released' }
      );
    } else {
      this.resetSelection();
    }
  }

  /**
   * buildAxis() is used to build the timeline chart, the brush area and the info area
   */
  buildAxis() {
    this.contentWidth = this.axis.nativeElement.offsetWidth - this.margin.left - this.margin.right;
    if (this.contentWidth <= 0) {
      this.contentWidth = 1024;
    }
    this.contentHeight = this.axis.nativeElement.offsetHeight - this.margin.top - this.margin.bottom;
    if (this.contentHeight <= 0) {
      this.contentHeight = 45;
    }
    this.axisScale = d3.scaleTime().domain(this.domain).range([0, this.contentWidth]);

    this.svg = d3.select('#axis')
      .append('svg')
      .attr('id', 'containerSvg')
      .attr('width', this.contentWidth + this.margin.left + this.margin.right)
      .attr('height', this.contentHeight + this.margin.top + this.margin.bottom + 50)
      .style('user-select', 'none');

    const xAxis = g => {
      this.svgAxis = g
        .append('g')
        .attr('width', this.contentWidth - 300)
        .attr('height', this.contentHeight - 20)
        .attr('transform', `translate(0,${this.contentHeight - 20})`);
    };

    const brush = g => {
      g.call(this.appendBrush)
        .on('start brush end', this.brushed)
        .on('end', this.brushReleased);
    };

    // Append Axis
    // TODO custom axis
    this.svg
      .append('g')
      .attr('id', 'axis-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .call(xAxis);

    // Append SelectionHelper
    this.svg
      .append('g')
      .attr('transform', `translate(${this.contentWidth + this.margin.right},47) scale(0.6)`)
      .call(this.drawSelectionHelper);

    // Append brush logic
    this.svg
      .append('g')
      .attr('id', 'brush-group')
      .attr('transform', `translate(${this.margin.left}, 65)`)
      .call(brush);
  }

  /**
   * updateAxis is used to update the timeline axis data and to reset the brush area
   * @param data the updated timeline data
   * @param domain the updated domain
   * @param interval the updated interval
   */
  updateAxis(data: HYTData[], domain: (number | Date)[], interval: TimeStep) {

    this.domain = domain;
    this.axisInterval = this.timeStepMap[interval];
    if (animation) {
      const oldData = [...this.data];
      this.data = [...data];
      d3.selectAll('.data-cube').attr('class', 'old-data-cube');
      this.drowData(interval);
      this.axisScale.domain(this.domain);
      this.svgAxis
        .transition().duration(this.transition.duration)
        .call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));
      const dist = this.contentWidth / this.stepInDomain[interval] / 2;
      d3.selectAll('.data-cube').data(this.data).transition().duration(this.transition.duration)
        .attr('transform', (d, i, n) => `translate(${this.axisScale(d.timestamp) +
          dist},${-this.contentHeight + 20}) scale(1.8)`)
        .style('opacity', 1);
      d3.selectAll('.old-data-cube').data(oldData).transition().duration(this.transition.duration)
        .attr('transform', (d, i, n) => `translate(${this.axisScale(d.timestamp) +
          dist},${-this.contentHeight + 20}) scale(1.8)`)
        .style('opacity', 0)
        .remove();
    } else {
      this.data = [...data];
      this.axisScale.domain(this.domain);
      this.drowData(interval);
      this.svgAxis
        .call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));
    }

    this.setBrush();

  }

  /**
   * setBrush() is used to programmatically set the brush
   */
  setBrush() {
    if (this.timeInterval[0] && this.timeInterval[1]) {
      // ? TODO variable instead of select() ?
      if (this.timeInterval[1] > this.timeInterval[0]) {
        this.setSelection(this.timeInterval.map(this.axisScale), d3.select('#brush-group'));
      } else {
        this.resetSelection();
      }
    }
  }

  /**
   * updateData is used to update the timeline data
   * @param data the updated timeline data
   */
  updateData(data) {
    this.maxValue = 1;
    if (data) {
      for (let i = 0; i < data.length; i++) {
        // this.data[i].value = data[i]?.value;
        this.data[i] = { value: data[i]?.value, timestamp: data[i]?.timestamp };
      }
    }
    this.data.forEach(y => {
      if (y.value > this.maxValue) {
        this.maxValue = y.value;
      }
    });
    this.rect.attr('fill', (d) => d.timestamp >= this.timeInterval[0] && d.timestamp < this.timeInterval[1] ?
      '#35d443' :
      this.setCubeIntensitiScale(d.value, this.maxValue)
    );
  }

  /**
   * Defintion of selectionHelper svg group
   */
  selectionHelper = g => {

    g.attr('id', 'container-selectionHelper');

    g.append('path')
      .attr('class', 'selectionHelper')
      // .attr('d', 'M 0 14 L 20 24 C 35 28, 35 0 20 4 Z');
      .attr('d', 'M11.6,13.5H0V2.5h11.6L16,8L11.6,13.5z M1,12.5h10.2L14.7,8l-3.6-4.5H1V12.5z');

    g.append('rect')
      .attr('transform', 'matrix(.7071 -.7071 .7071 .7071 -3.753 6.9393)')
      .attr('x', '6')
      .attr('y', '5.2')
      .attr('width', '1')
      .attr('height', '5.7');

    g.append('rect')
      .attr('transform', 'matrix(.7071 -.7071 .7071 .7071 -3.753 6.9393)')
      .attr('x', '3.7')
      .attr('y', '7.5')
      .attr('width', '5.7')
      .attr('height', '1');
  }

  /**
   * drawSelectionHelper is used to draw the selectionHelper
   */
  drawSelectionHelper = g => {
    g.call(this.selectionHelper)
      .on('mouseover', (d) => {
        d3.select(d).attr('fill', 'red');
      })
      .on('mouseover', (d) => {
        d3.select(d).attr('fill', '#cccccc');
      })
      .on('click', () => {
        this.resetSelection();
        this.brushed();
      });
  }

  /**
   * Function used to reset timeline selection by button
   */
  resetSelectionByBtn() {
    this.resetSelection();
    this.rect.attr('fill', d => this.setCubeIntensitiScale(d.value, this.maxValue));
    this.controlButtons.nativeElement.style.display = 'none';
    /* show text tip */
    this.selectionInitialTip.nativeElement.style.display = 'block';
  }

  /**
   * Wrapping d3 dataIntensityScale
   * @param value
   * @param maxValue
   * @returns
   */
  setCubeIntensitiScale(value, maxValue) {
    let ratio = value / maxValue;

    // avoiding filling with grey even if there's data
    if (ratio < 0.2 && value > 0) {
      ratio = 0.2;
    }
    const intensity = this.dataIntensityScale(ratio);

    return intensity;
  }

  /**
   * setSelection() is used to update the rendered selection and to emit events of the new time selection
   */
  setSelection(s, g, event?) {
    // ? TODO add transitions
    // .transition()
    // .duration(this.transition.duration)
    this.selectionPx = s;
    this.selectionRenderSvg
      .attr('width', s[1] - s[0])
      .attr('x', s[0]);
    this.selectionSvg
      .attr('width', s[1] - s[0])
      .attr('x', s[0]);
    this.rightHandle
      .attr('style', '')
      .attr('cx', s[1]);
    this.leftHandle
      .attr('style', '')
      .attr('cx', s[0]);

    if (g && event) {
      g.dispatch(event.type, { detail: { selection: this.selectionPx, mode: event.mode } });
    } else {
      g.dispatch('brush', { detail: { selection: this.selectionPx, mode: 'code' } });
    }
  }

  /**
   * resetSelection() is used to delete the time selection
   */
  resetSelection() {
    this.dashboardEvent.selectedDateIntervalForExport.next(this.defaultExportInterval);

    this.selectionPx = [null, null];
    this.timeInterval = [null, null];
    this.dashboardEvent.timelineEvent.next(DashboardEvent.Timeline.RESET);
    this.dataTimeSelectionChanged.emit(this.timeInterval);
    this.selectionRenderSvg
      .attr('width', null)
      .attr('x', null)
      .style('display', 'none');
    this.selectionSvg
      .attr('width', null)
      .attr('x', null)
      .style('display', 'none');
    this.rightHandle.attr('style', '')
      .attr('cx', null)
      .style('display', 'none');
    this.leftHandle.attr('style', '')
      .attr('cx', null)
      .style('display', 'none');
  }

  /**
   * Emits the current time selection
   */
  emitCurrentSelection() {
    this.dashboardEvent.timelineEvent.next(DashboardEvent.Timeline.REFRESH);
    this.dataTimeSelectionChanged.emit(this.timeInterval);
  }

  /**
   * appendBrush is used to append svg brush logic
   */
  appendBrush = g => {

    g.append('path')
      .attr('d', `M 0 ${this.brushArea.h / 2} H ${this.contentWidth}`)
      .attr('stroke', 'grey');
    this.container = g.append('rect')
      .attr('class', 'overlay')
      .attr('x', 0)
      .attr('y', 0)
      .attr('pointer-events', 'all')
      // .attr('cursor', 'col-resize')
      .attr('fill', 'transparent')
      .attr('width', this.contentWidth)
      .attr('height', this.brushArea.h)
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          this.selectionSvg.attr('style', '');
          this.selectionRenderSvg.attr('style', '');
          this.leftHandle.attr('style', '').attr('y', 0);
          this.rightHandle.attr('style', '').attr('y', 0);
          this.setSelection([d3.event.subject.x, d3.event.subject.x], g, { type: 'start', mode: 'container' });

          /* hide control buttons section */
          this.controlButtons.nativeElement.style.display = 'none';
          /* show text tip */
          this.selectionInitialTip.nativeElement.style.display = 'block';

        })
        .on('drag', (d) => {
          const sel = d3.event.x > d3.event.subject.x ?
            [d3.event.subject.x, (d3.event.x > this.contentWidth) ? this.contentWidth : d3.event.x] :
            [(d3.event.x < 0) ? 0 : d3.event.x, d3.event.subject.x];
          this.setSelection(sel, g, { type: 'brush', mode: 'container' });
        })
        .on('end', (d) => {
          g.attr('pointer-events', 'all');
          g.dispatch('end', { detail: { selection: this.selectionPx, mode: 'container' } });
          /* show reset selection button */
          const elSelectionRender = document.querySelector('#brush-group .selection').getAttribute('style');
          if (!elSelectionRender) {
            this.controlButtons.nativeElement.style.display = 'flex';
            /* hide text tip */
            this.selectionInitialTip.nativeElement.style.display = 'none';
          }


        })
      );

    this.selectionRenderSvg = g.append('rect')
      .attr('class', 'selectionRender')
      .attr('x', 0)
      .attr('y', this.brushArea.h / 2)
      .attr('height', 1)
      .attr('fill', 'transparent')
      .attr('cursor', 'grab')
      .style('display', 'none');

    this.selectionSvg = g.append('rect')
      .attr('class', 'selection')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', this.brushArea.h)
      .attr('fill', 'transparent')
      // .attr('cursor', 'grab')
      .style('display', 'none')
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          // this.container.attr('cursor', 'grabbing');
          g.dispatch('start', { detail: { selection: this.selectionPx, mode: 'contaselectioniner' } });
        })
        .on('drag', (d) => {
          // TOFIX when mouse position is out of range.
          if (d3.event.x < 0 || d3.event.x > this.contentWidth) {
            return;
          }
          const sel = [this.selectionPx[0] + d3.event.dx, this.selectionPx[1] + d3.event.dx];
          this.setSelection(sel, g, { type: 'brush', mode: 'selection' });
        })
        .on('end', (d) => {
          g.attr('pointer-events', 'all');
          this.container.attr('cursor', 'pointer');
          g.dispatch('end', { detail: { selection: this.selectionPx, mode: 'selection' } });
        })
      );

    let remember;
    this.leftHandle = g.append('circle')
      .attr('class', 'handle handle--w')
      .attr('cx', 0)
      .attr('cy', this.brushArea.h / 2)
      .attr('cursor', 'grab')
      .attr('r', this.handleRadius.w)
      .style('display', 'none')
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          this.container.attr('cursor', 'grab');
          remember = this.selectionPx[1];
          g.dispatch('start', { detail: { selection: this.selectionPx, mode: 'handle' } });
        })
        .on('drag', (d) => {
          const sel = d3.event.x < remember ?
            [(d3.event.x > 0 && d3.event.x < this.contentWidth) ? d3.event.x : ((d3.event.x < 0) ? 0 : this.contentWidth), remember] :
            [remember, (d3.event.x > this.contentWidth) ? this.contentWidth : d3.event.x];
          this.setSelection(sel, g, { type: 'brush', mode: 'handle' });
        })
        .on('end', (d) => {
          g.attr('pointer-events', 'all');
          this.container.attr('cursor', 'pointer');
          g.dispatch('end', { detail: { selection: this.selectionPx, mode: 'handle' } });
        })
      );

    this.rightHandle = g.append('circle')
      .attr('class', 'handle handle--e')
      .attr('cx', 0)
      .attr('cy', this.brushArea.h / 2)
      .attr('cursor', 'grab')
      .attr('r', this.handleRadius.e)
      .style('display', 'none')
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          this.container.attr('cursor', 'grab');
          remember = this.selectionPx[0];
          g.dispatch('start', { detail: { selection: this.selectionPx, mode: 'handle' } });
        })
        .on('drag', (d) => {
          const sel = d3.event.x >= remember ?
            [remember, (d3.event.x > 0 && d3.event.x < this.contentWidth) ? d3.event.x : ((d3.event.x < 0) ? 0 : this.contentWidth)] :
            [(d3.event.x > 0) ? d3.event.x : 0, remember];
          this.setSelection(sel, g, { type: 'brush', mode: 'handle' });
        })
        .on('end', (d) => {
          g.attr('pointer-events', 'all');
          this.container.attr('cursor', 'pointer');
          g.dispatch('end', { detail: { selection: this.selectionPx, mode: 'handle' } });
        })
      );
  }

  /**
   * appendCube is used to append the svg cube
   */
  appendCube = g => {
    g.append('path')
      .attr('d', 'M0 0 L5 2 L5 8 L0 10 L-5 8 L-5 2 z');
    g.append('path')
      .attr('d', 'M-5 2 L0 4 L5 2');
    g.append('path')
      .attr('d', 'M0 4 L0 10');
  }

  /**
   * drowData is used to draw the timeline data cube
   * @param interval the updated step interval
   */
  drowData(interval) {
    const distance = this.contentWidth / this.stepInDomain[interval] / 2;

    if (!animation) {
      d3.selectAll('#cube-container').remove();
    }
    this.rect = this.svgAxis
      .append('g')
      .attr('id', 'cube-container')
      .style('stroke', 'black')
      // TODO TOFIX width and scale
      .style('stroke-width', '0.2px')
      .selectAll('g')
      .data(this.data)
      .join('g')
      .attr('fill', d => d.timestamp >= this.timeInterval[0] && d.timestamp < this.timeInterval[1]
        ? '#35d443' : this.setCubeIntensitiScale(d.value, this.maxValue))
      .attr('class', 'data-cube')
      .call(this.appendCube)
      .attr('cursor', 'pointer')
      .style('opacity', animation ? 0 : 1)
      .attr('transform', (d, i, n) => `translate(${this.axisScale(d.timestamp) +
        distance},${-this.contentHeight + 20}) scale(1.8)`) // scale(0.3)  //TODO make variable
      .on('mouseover', (d, i, n) => {
        d3.select(n[i]).attr('transform', `translate(${this.axisScale(d.timestamp) +
          distance},${-this.contentHeight + 20}) scale(2.1)`);
      })
      .on('mouseout', (d, i, n) => {
        d3.select(n[i]).attr('transform', `translate(${this.axisScale(d.timestamp) +
          distance},${-this.contentHeight + 20}) scale(1.8)`);
      })
      .on('click', (d, i, n) => {
        this.domainSet.emit(d.timestamp);
      });
  }

}
