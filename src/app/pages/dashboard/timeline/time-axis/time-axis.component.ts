import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { ResizeSensor } from 'css-element-queries';
import * as d3 from 'd3';
import * as moment from 'moment';
import { HYTData } from '../timeline.component';
import { TimeStep } from '@hyperiot/components';

const animation = false;

@Component({
  selector: 'hyt-time-axis',
  templateUrl: './time-axis.component.html',
  styleUrls: ['./time-axis.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeAxisComponent implements OnInit, AfterViewInit {

  timeStepMap = {
    year: d3.timeYear,
    month: d3.timeMonth,
    day: d3.timeDay,
    hour: d3.timeHour,
    minute: d3.timeMinute,
    second: d3.timeSecond,
    millisecond: d3.timeMillisecond
  };

  @ViewChild('axis', { static: false }) axis: ElementRef;

  //green selection changed
  @Output()
  dataTimeSelectionChanged = new EventEmitter();

  //cube selected
  @Output()
  domainSet = new EventEmitter();

  data: HYTData[] = [];

  svg;

  timeInterval = [];
  selectionPx = [null, null];

  domain: (number | Date)[] = [0, 0];
  margin = { top: 5, right: 20, bottom: 20, left: 20 };
  axisScale: d3.ScaleTime<number, number>;
  tickScale = d3.scaleLinear().domain([0, 10000]).range([0, 9]);
  dataIntensityScale = d3.interpolate('#999999', '#003cff');//('#0066ff', '#33ff00');

  colorLogScale = d3.scaleLog().domain([0, 1000]).range([0, 100]);
  svgAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  axisInterval: d3.CountableTimeInterval = d3.timeHour;
  element: any;
  ticks;

  handleRadius = { w: 4, e: 4 };
  brushArea = { w: -1, h: 10 };
  transition = { duration: 1000, type: '' };

  brush;

  maxValue = 1;

  rangeMap = {
    minute: d3.timeMinute,
    hour: d3.timeHour,
    day: d3.timeDay,
    month: d3.timeMonth
  };

  contentWidth;
  contentHeight;

  stepInDomain = {
    year: 1,
    month: 12,
    day: moment(this.domain[0]).daysInMonth(),
    hour: 24,
    minute: 60,
    second: 60
  };

  // BRUSH PROPERTIES
  //TODO type
  rect;
  container;
  selectionSvg;
  selectionRenderSvg;
  rightHandle;
  leftHandle;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.buildAxis();
  }

  brushed = () => {
    const selection = d3.event.detail.selection;
    const mode = d3.event.detail.mode;
    if (selection) {
      if (mode !== 'code') {
        this.timeInterval = selection.map(d => this.axisInterval.round(this.axisScale.invert(d)));
      }
      if (mode === 'code-released') {
        this.dataTimeSelectionChanged.emit(this.timeInterval);
      }
      this.rect.attr('fill', (d) =>
        d.timestamp >= this.timeInterval[0] && d.timestamp < this.timeInterval[1] ?
          '#35d443' :
          this.dataIntensityScale(d.value / this.maxValue)
      );
    } else {
      this.rect.attr('fill', d => this.dataIntensityScale(d.value / this.maxValue));
    }
  }

  brushReleased = () => {
    const selection = d3.event.detail.selection;
    this.timeInterval = selection.map(d => this.axisInterval.round(this.axisScale.invert(d)));
    this.setSelection(
      this.timeInterval[1] > this.timeInterval[0] ? this.timeInterval.map(this.axisScale) : null,
      d3.select('#brush-group'),
      { type: 'brush', mode: 'code-released' }
    );
  }

  buildAxis() {
    this.element = this.axis.nativeElement;
    this.contentWidth = this.element.offsetWidth - this.margin.left - this.margin.right;
    this.contentHeight = this.element.offsetHeight - this.margin.top - this.margin.bottom;
    this.axisScale = d3.scaleTime().domain(this.domain).range([0, this.contentWidth]);

    this.svg = d3.select('#axis')
      .append('svg')
      .attr('id', 'containerSvg')
      .attr('width', this.contentWidth + this.margin.left + this.margin.right)
      .attr('height', this.contentHeight + this.margin.top + this.margin.bottom);

    const xAxis = g => {
      this.svgAxis = g
        .append('g')
        .attr('width', this.contentWidth)
        .attr('height', this.contentHeight - 20) //TODO make variable
        .attr('transform', `translate(0,${this.contentHeight - 20})`); //TODO make variable

      this.svgAxis.append("g").attr('class', 'cube-container')
    };

    this.brush = g => {
      g.call(this.appendBrush)
        .on('start brush end', this.brushed)
        .on('end', this.brushReleased);
    };

    this.svg
      .append('g')
      .attr('id', 'axis-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .call(xAxis);

    this.svg
      .append('g')
      .attr('transform', `translate(${this.contentWidth + this.margin.right},47) scale(0.6)`)//TODO make variable
      .call(this.drawSelectionHelper);

    this.svg
      .append('g')
      .attr('id', 'brush-group')
      .attr('transform', `translate(${this.margin.left},55)`) //TODO make variable
      .call(this.brush);
  }

  updateRange() {
    this.axisScale.range([this.margin.left, this.contentWidth - this.margin.right]);
    this.svgAxis.call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));

    if (this.data) {
      this.drowData(null);
    }
  }

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
        .transition().duration(1000)
        .call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));
      const dist = this.contentWidth / this.stepInDomain[interval] / 2;
      d3.selectAll('.data-cube').data(this.data).transition().duration(1000)
        .attr('transform', (d, i, n) => `translate(${this.axisScale(d.timestamp) +
          dist},${-this.contentHeight + 20}) scale(1.8)`)
        .style('opacity', 1)
      d3.selectAll('.old-data-cube').data(oldData).transition().duration(1000)
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

  setBrush() {
    if (this.timeInterval[0] && this.timeInterval[1]) {
      //TODO variable instead of select() ?
      this.setSelection(this.timeInterval[1] > this.timeInterval[0] ? this.timeInterval.map(this.axisScale) : null, d3.select('#brush-group'));
    }
  }

  destroyAxis() {
    d3.select('#axisSvg').remove();
  }

  updateData(data) {
    this.maxValue = 1;
    for (let i = 0; i < data.length; i++) {
      this.data[i].value = data[i].value;
    }
    this.data.forEach(y => {
      if (y.value > this.maxValue) {
        this.maxValue = y.value;
      }
    });
    this.rect.attr('fill', (d) => d.timestamp >= this.timeInterval[0] && d.timestamp < this.timeInterval[1] ?
      '#35d443' :
      this.dataIntensityScale(d.value / this.maxValue)
    );
  }

  selectionHelper = g => {
    g.append('path')
      .attr('class', 'selectionHelper')
      .attr('d', 'M 0 14 L 20 24 C 35 28, 35 0 20 4 Z')
    // .attr('stroke', '#cccccc')
    // .attr('fill', '#cccccc')
  }

  drawSelectionHelper = g => {
    g.call(this.selectionHelper)
      .on('mouseover', (d) => {
        console.log(d);
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


  setSelection(s, g, event?) {

    //TODO add transitions
    // .transition()
    // .duration(100)
    this.selectionPx = s;
    if (!s) {
      this.selectionPx = [null, null];
      this.resetSelection();
      return;
    }
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

  resetSelection() {
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

  appendBrush = g => {

    g.append('path')
      .attr('d', `M 0 ${this.brushArea.h / 2} H ${this.contentWidth}`)
      .attr('stroke', 'grey');

    this.container = g.append('rect')
      .attr('class', 'overlay')
      .attr('x', 0)
      .attr('y', 0)
      .attr('pointer-events', 'all')
      .attr('cursor', 'pointer')
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
      .attr('cursor', 'grab')
      .style('display', 'none')
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          this.container.attr('cursor', 'grabbing');
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

  appendCube = g => {
    g.append('path')
      .attr('d', 'M0 0 L5 2 L5 8 L0 10 L-5 8 L-5 2 z');
    g.append('path')
      .attr('d', 'M-5 2 L0 4 L5 2');
    g.append('path')
      .attr('d', 'M0 4 L0 10');
  }

  drowData(interval) {
    const distance = this.contentWidth / this.stepInDomain[interval] / 2;
    // svg width:  (d3.select(n[i]) as any).node().getBBox().width

    if (!animation) {
      d3.selectAll('#cube-container').remove();
    }
    this.rect = this.svgAxis
      .append('g')
      .attr('id', 'cube-container')
      .style('stroke', 'black')
      //TODO TOFIX width and scale
      .style('stroke-width', '0.2px')
      .selectAll('rect')
      .data(this.data)
      .join('g')
      .attr('fill', d => d.timestamp >= this.timeInterval[0] && d.timestamp < this.timeInterval[1] ? '#35d443' : this.dataIntensityScale(d.value / this.maxValue))
      .attr('class', 'data-cube')
      .call(this.appendCube)
      .attr('cursor', 'pointer')
      .style('opacity', animation ? 0 : 1)
      .attr('transform', (d, i, n) => `translate(${this.axisScale(d.timestamp) +
        distance},${-this.contentHeight + 20}) scale(1.8)`) // scale(0.3)  //TODO make variable
      .on('mouseover', (d, i, n) => {
        d3.select(n[i]).attr('transform', `translate(${this.axisScale(d.timestamp) +
          distance},${-this.contentHeight + 20}) scale(2.1)`)
      })
      .on('mouseout', (d, i, n) => {
        d3.select(n[i]).attr('transform', `translate(${this.axisScale(d.timestamp) +
          distance},${-this.contentHeight + 20}) scale(1.8)`);
      })
      .on('click', (d, i, n) => {
        this.domainSet.emit([d.timestamp, n[i + 1]])
      });

  }

}
