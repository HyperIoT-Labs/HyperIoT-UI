import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { ResizeSensor } from 'css-element-queries';
import * as d3 from 'd3';
import { HYTData } from '../timeline.component';

@Component({
  selector: 'hyt-time-axis',
  templateUrl: './time-axis.component.html',
  styleUrls: ['./time-axis.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeAxisComponent implements OnInit, AfterViewInit {

  @ViewChild('axis', { static: false }) axis: ElementRef;

  @Output()
  dataTimeSelectionChanged = new EventEmitter();

  data: HYTData[];

  svg;

  timeInterval = [];
  selectionPx = [null, null];

  domain: (number | Date | { valueOf(): number; })[] = [0, 0];
  margin = { top: 5, right: 15, bottom: 20, left: 15 };
  axisScale: d3.ScaleTime<number, number>;
  tickScale = d3.scaleLinear().domain([0, 10000]).range([0, 9]);
  dataIntensityScale = d3.interpolate('#bbbbbb', '#0066ff');//('#0066ff', '#33ff00');
  //d3.scaleQuantize<any>().domain([0, 1000]).range(['#0066ff', '#33ff00']);
  // svgCont: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  svgAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  axisInterval: d3.CountableTimeInterval = d3.timeHour;
  element: any;
  ticks;

  brush;

  rangeMap = {
    minute: d3.timeMinute,
    hour: d3.timeHour,
    day: d3.timeDay,
    month: d3.timeMonth
  };

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.buildAxis();

  }

  contentWidth;
  contentHeight;

  brushed = () => {
    const selection = d3.event.detail.selection;
    if (selection) {
      this.timeInterval = selection.map(d => this.axisInterval.round(this.axisScale.invert(d)));
      this.rect.attr('fill', (d) =>
        d.timestamp >= this.timeInterval[0] && d.timestamp < this.timeInterval[1] ?
          '#35d443' :
          (d.value < 5000 ?
            '#999999' : 'blue')
      );
    } else {
      this.rect.attr('fill', d => d.value < 5000 ? 'grey' : 'blue');
    }
  }

  brushReleased = () => {
    const selection = d3.event.detail.selection;
    this.timeInterval = selection.map(d => this.axisInterval.round(this.axisScale.invert(d)));
    this.dataTimeSelectionChanged.emit(this.timeInterval);
    this.setSelection(
      this.timeInterval[1] > this.timeInterval[0] ? this.timeInterval.map(this.axisScale) : null,
      d3.select('#brush-group')
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

    this.brush = g => {
      g.call(this.appendBrush)
        .on('start brush end', this.brushed)
        .on('end', this.brushReleased);
    };

    const xAxis = g => {
      this.svgAxis = g
        .append('g')
        .attr('width', this.contentWidth)
        .attr('height', this.contentHeight)
        .attr('transform', `translate(0,${this.contentHeight})`);
    };

    this.svg
      .append('g')
      .attr('id', 'axis-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .call(xAxis);

    this.svg
      .append('g')
      .attr('id', 'brush-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .call(this.brush);

  }

  updateRange() {
    this.axisScale.range([this.margin.left, this.contentWidth - this.margin.right]);
    this.svgAxis.call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));

    this.tickTextRemove(this.contentWidth);
    if (this.data) {
      this.drowData();
    }
    this.youAreHere();
  }

  // setTicks = g => {
  //   g.append('line')
  // }

  updateAxis(domain?: (number | Date | { valueOf(): number; })[], interval?: d3.CountableTimeInterval) {
    if (domain) {
      this.domain = domain;
    }
    if (interval) {
      this.axisInterval = interval;
    }
    this.axisScale.domain(this.domain);
    this.svgAxis.append('rect')



    this.svgAxis.call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));
    this.tickTextRemove(this.contentWidth);

    if (this.data) {
      this.drowData();
    }
    this.youAreHere();
    this.setBrush();
  }

  setBrush() {
    if (this.timeInterval[0] && this.timeInterval[1]) {
      //TODO variable instead of select() ?
      console.log("prova")
      this.setSelection(this.timeInterval[1] > this.timeInterval[0] ? this.timeInterval.map(this.axisScale) : null, d3.select('#brush-group'));
      // d3.select('#containerSvg #brush-group').call(
      //   this.brush.move,
      //   [this.axisScale(this.timeInterval[0]), this.axisScale(this.timeInterval[1])]
      // );
    }
  }

  youAreHere() {
    d3.select('circle').remove();
    this.svgAxis.append('circle').attr('cx', this.axisScale(new Date()))
      .attr('cy', '0')
      .attr('r', '5px')
      .style('fill', 'red');
  }

  destroyAxis() {
    d3.select('#axisSvg').remove();
  }

  insertData(data) {
    this.data = [...data];
    this.drowData();
  }

  rect;

  container;
  selectionSvg
  rightHandle
  leftHandle
  hs = 4; //handle size


  setSelection(s, g, event?) {

    //TODO add transitions
    // .transition()
    // .duration(100)
    this.selectionPx = s;
    if (!s) {
      this.selectionPx = [null, null];
      this.resetSelection(g);
      return;
    }
    this.selectionSvg
      .attr('width', s[1] - s[0])
      .attr('x', s[0]);
    this.rightHandle.attr('style', '')
      .attr('x', s[1] - this.hs / 2);
    this.leftHandle.attr('style', '')
      .attr('x', s[0] - this.hs / 2);

    if (g && event) {
      g.dispatch(event.type, { detail: { selection: this.selectionPx, mode: event.mode } });
    } else {
      g.dispatch('brush', { detail: { selection: this.selectionPx, mode: 'code' } });
    }
  }

  resetSelection(g) {
    this.selectionSvg
      .attr('width', null)
      .attr('x', null)
      .style('display', 'none');
    this.rightHandle.attr('style', '')
      .attr('x', null)
      .style('display', 'none');
    this.leftHandle.attr('style', '')
      .attr('x', null)
      .style('display', 'none');
  }

  appendBrush = g => {

    this.container = g.append('rect')
      .attr('class', 'overlay')
      .attr('x', 0)
      .attr('y', 0)
      .attr('pointer-events', 'all')
      .attr('cursor', 'crosshair')
      .attr('fill', 'transparent')
      .attr('width', this.contentWidth)
      .attr('height', this.contentHeight)
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          this.selectionSvg.attr('style', '');
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

    this.selectionSvg = g.append('rect')
      .attr('class', 'selection')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', this.contentHeight)
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
          this.container.attr('cursor', 'crosshair');
          g.dispatch('end', { detail: { selection: this.selectionPx, mode: 'selection' } });
        })
      );

    let remember;
    this.leftHandle = g.append('rect')
      .attr('class', 'handle handle--w')
      .attr('x', 0)
      .attr('y', 0)
      .attr('cursor', 'ew-resize')
      .attr('width', this.hs)
      .attr('height', this.contentHeight)
      .style('display', 'none')
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          this.container.attr('cursor', 'ew-resize');
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
          this.container.attr('cursor', 'crosshair');
          g.dispatch('end', { detail: { selection: this.selectionPx, mode: 'handle' } });
        })
      );

    this.rightHandle = g.append('rect')
      .attr('class', 'handle handle--e')
      .attr('x', 0)
      .attr('y', 0)
      .attr('cursor', 'ew-resize')
      .attr('width', this.hs)
      .attr('height', this.contentHeight)
      .style('display', 'none')
      .call(d3.drag()
        .on('start', (d) => {
          g.attr('pointer-events', 'none');
          this.container.attr('cursor', 'ew-resize');
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
          this.container.attr('cursor', 'crosshair');
          g.dispatch('end', { detail: { selection: this.selectionPx, mode: 'handle' } });
        })
      );
  }

  appendHytShape = g => {
    g.call(this.appendBottomPath);
    g.call(this.appendCube);
    g.call(this.appendTimeText);
  }

  appendTimeText = g => {
    const formatTime = d3.timeFormat('%H:%M');
    g.append('text')
      .style('font-size', 4)
      .attr('x', 0)
      .attr('y', 18)
      .text(d => formatTime(d.timestamp));
  }

  appendBottomPath = g => {
    let lineHeight = 6;
    g.append('rect')
      .attr('x', -1)
      .attr('y', 8)
      .attr('height', lineHeight)
      .attr('width', 12)
      .style('stroke-width', 0);
  }

  appendCube = g => {
    g.append('path')
      .attr('d', 'M5 0 L10 2 L10 8 L5 10 L0 8 L0 2 z');
    g.append('path')
      .attr('d', 'M0 2 L5 4 L10 2');
    g.append('path')
      .attr('d', 'M5 4 L5 10');
  }

  drowData() {
    const ticks = this.axisScale.ticks();
    ticks.forEach(x => console.log(this.axisScale(x)))
    const distance = this.axisScale(ticks[2]) - this.axisScale(ticks[1])



    d3.selectAll('.data-cube').remove();
    this.rect = this.svgAxis
      .append('g')
      .style('stroke', 'black')
      //TODO TOFIX width and scale
      .style('stroke-width', '0.2px')
      .selectAll('rect')
      .data(this.data)
      .join('g')
      .attr('fill', (d) => d.value < 5000 ? '#999999' : 'blue')
      .attr('class', 'data-cube')
      .call(this.appendCube)
      .attr('transform', (d) => `translate(${this.axisScale(d.timestamp) + 1.5},${-this.contentHeight}) scale(2)`); // scale(0.3)

    // this.svgAxis.append('g')
    //   .attr('id', 'ticksContainer')
    //   .selectAll('line')
    //   .data(this.data)
    //   .join('line')
    //   .attr('x1', d => this.axisScale(d.timestamp))
    //   .attr('x2', d => this.axisScale(d.timestamp))
    //   .attr('y1', -30)
    //   .attr('y2', 30)
    //   .style('stroke-width', 1)
    //   .style('stroke', 'grey');

  }

  tickTextRemove(width: number) {
    // const ticks = this.svgAxis.selectAll('#axisSvg .tick');
    // const n = Math.round(ticks.size() / this.tickScale(width));

    // console.log(ticks.size())
    // console.log(this.tickScale(width));
    // console.log(n);
    // console.log(this.svgAxis.selectAll('#axisSvg .tick text').size());

    // this.svgAxis.selectAll('#axisSvg .tick text').filter((d, i) => !(i % n === 0)).remove();

  }

  generalButton() {
    console.log(this.timeInterval);
    const endDate = new Date();
    // const initDate = new Date(endDate);
    // initDate.setMinutes(initDate.getMinutes() - 20);
    // console.log('general button')
    d3.select('#containerSvg #brush-group').call(
      this.brush.move,
      [this.axisScale(endDate), this.axisScale(endDate)]
    );
    // this.brush.move(d3.select(this), [
    //   this.axisScale(new Date(2020, 1, 15, 10, 15, 0, 0)),
    //   this.axisScale(new Date(2020, 1, 15, 10, 35, 0, 0)),
    // ])
  }

}
