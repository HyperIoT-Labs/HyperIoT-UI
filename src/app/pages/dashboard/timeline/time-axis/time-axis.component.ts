import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ResizeSensor } from 'css-element-queries';
import * as d3 from 'd3';
import { HYTData } from '../timeline.component';

@Component({
  selector: 'hyt-time-axis',
  templateUrl: './time-axis.component.html',
  styleUrls: ['./time-axis.component.scss']
})
export class TimeAxisComponent implements OnInit, AfterViewInit {

  @ViewChild('axis', { static: false }) axis: ElementRef;

  data: HYTData[];

  svg;

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

  // TODO boolean used to handle resizesensor issue
  firstTime = true;

  contentWidth;
  contentHeight;

  brushended() {
    console.log("OKOK")
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
    console.log([[this.margin.left, this.margin.top], [this.contentWidth - this.margin.right, this.contentHeight - this.margin.top]])
    const brush = d3.brushX()
      .extent([[0, 0], [this.contentWidth, this.contentHeight]])
      // .on('start brush end', () => {
      //   const selection = d3.event.selection;
      //   console.log(selection)

      //   if (selection) {
      //     const range = this.axisScale.domain().map(this.axisScale);
      //     const i0 = d3.bisectRight(range, selection[0]);
      //     const i1 = d3.bisectRight(range, selection[1]);
      //     console.log(i0)
      //     console.log(i1)
      //     this.rect.attr('fill', (d, i) => i0 <= i && i < i1 ? "green" : null);
      //   } else {
      //     this.rect.attr('fill', null);
      //   }

      // })
      .on('end', () => {
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !(d3.event.sourceEvent instanceof MouseEvent) || !selection) { return; }
        const [x0, x1] = selection.map(d => this.axisInterval.round(this.axisScale.invert(d)));
        d3.select('#brush-group')
          .transition()
          //TODO remove 'as any'
          .call(brush.move as any, x1 > x0 ? [x0, x1].map(this.axisScale) : null);
      });

    const xAxis = g => {
      this.svgAxis = g
        .append('g')
        .attr('transform', `translate(0,${this.contentHeight})`);
    };

    this.svg
      .append('g')
      .attr('id', 'brush-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .call(brush);

    this.svg
      .append('g')
      .attr('id', 'axis-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .call(xAxis);

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

  updateAxis(domain?: (number | Date | { valueOf(): number; })[], interval?: d3.CountableTimeInterval) {
    if (domain) {
      this.domain = domain;
    }
    if (interval) {
      this.axisInterval = interval;
    }
    this.axisScale.domain(this.domain);
    this.svgAxis.call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));
    this.tickTextRemove(this.contentWidth);

    if (this.data) {
      this.drowData();
    }
    this.youAreHere();
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

  drowData() {
    d3.selectAll('.data-rect').remove();
    this.rect = this.svgAxis
      .append('g')
      .style('fill', 'blue')
      .selectAll('rect')
      .data(this.data)
      .join("rect")
      .attr('class', 'data-rect')
      // .style('fill', (d) => this.dataIntensityScale(d.value / 10000))
      .attr('x', (d) => this.axisScale(d.timestamp))
      .attr('width', '20px')
      .attr('y', '-20px')
      .attr('height', '20px');
    // .enter().append('rect')
    // .attr('class', 'data-rect')
    // .style('fill', (d) => this.dataIntensityScale(d.value / 10000))
    // .attr('x', (d) => this.axisScale(d.timestamp))
    // .attr('width', '20px')
    // .attr('y', '-20px')
    // .attr('height', '20px');
  }

  tickTextRemove(width: number) {
    // console.log('tickTextRemove')
    // const ticks = this.svgAxis.selectAll('#axisSvg .tick');
    // const n = Math.round(ticks.size() / this.tickScale(width));

    // console.log(ticks.size())
    // console.log(this.tickScale(width));
    // console.log(n);
    // console.log(this.svgAxis.selectAll('#axisSvg .tick text').size());

    // this.svgAxis.selectAll('#axisSvg .tick text').filter((d, i) => !(i % n === 0)).remove();

  }

}
