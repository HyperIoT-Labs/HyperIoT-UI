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

  domain: (number | Date | { valueOf(): number; })[] = [0, 0];
  margin = { top: 5, right: 15, bottom: 20, left: 15 };
  axisScale: d3.ScaleTime<number, number>;
  tickScale = d3.scaleLinear().domain([0, 10000]).range([0, 9]);
  dataIntensityScale = d3.interpolate('#bbbbbb', '#0066ff');//('#0066ff', '#33ff00');
  //d3.scaleQuantize<any>().domain([0, 1000]).range(['#0066ff', '#33ff00']);
  svgCont: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  svgAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  axisInterval: d3.CountableTimeInterval = d3.timeHour;
  element: any;
  ticks;

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

  buildAxis() {
    this.element = this.axis.nativeElement;
    this.contentWidth = this.element.offsetWidth - this.margin.left - this.margin.right;
    this.contentHeight = this.element.offsetHeight - this.margin.top - this.margin.bottom;
    this.axisScale = d3.scaleTime().domain(this.domain).range([0, this.contentWidth]);
    this.svgCont = d3.select('#axis')
      .append('svg')
      .attr('id', 'axisSvg')
      .attr('width', this.contentWidth + this.margin.left + this.margin.right)
      .attr('height', this.contentHeight + this.margin.left + this.margin.right)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.svgAxis = this.svgCont
      .append('g')
      .attr('transform', `translate(0,${this.contentHeight})`);
    //this.updateAxis();
    // let st;
    // const resizeSensor = new ResizeSensor(this.axis.nativeElement, () => {
    //   if (this.firstTime) {
    //     this.firstTime = false;
    //     return;
    //   }
    //   if (st) {
    //     clearTimeout(st);
    //   }
    //   st = setTimeout(() => {
    //     this.updateRange();
    //   }, 150);
    // });
  }

  updateRange() {
    this.axisScale.range([0, this.contentWidth]);
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
    this.svgAxis
      .call(d3.axisBottom(this.axisScale).ticks(this.axisInterval));
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

  brush;



  drowData() {
    d3.selectAll('.data-rect').remove();
    this.svgCont.selectAll('bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'data-rect')
      .style('fill', (d) => this.dataIntensityScale(d.value / 10000))
      .attr('x', (d) => this.axisScale(d.timestamp))
      .attr('width', '20px')
      .attr('y', this.contentHeight - 20)
      .attr('height', '20px');

    this.brush = d3.brushX()
      .extent([[0, 0], [this.element.contentWidth, this.element.contentHeight]])
      .on('brush end', () => {
        console.log(d3.event.selection);
        // var s = d3.event.selection || this.ax2.range();
        // this.ax.domain(s.map(this.ax2.invert, this.ax2));
        // this.timeViewXDomain = this.ax.domain();


        // this.brushProp[0] = (100 * (s[0] - this.ax.range()[0])) / (this.ax.range()[1] - this.ax.range()[0])
        // this.brushProp[1] = 100 - (100 * (this.ax.range()[1] - s[1])) / (this.ax.range()[1] - this.ax.range()[0])
      });

    this.svgCont.append('g')
      .attr('class', 'brush')
      .attr('width', this.contentWidth)
      .attr('height', this.contentHeight)
      .call(this.brush);

    let brush = (d3.brush() as any)
      .x(this.axisScale)
      .on('brush', this.brushed);

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

  brushed() {
    // var selected = null;
    // selected = x2.domain()
    //   .filter(function (d) {
    //     return (brush.extent()[0] <= x2(d)) && (x2(d) <= brush.extent()[1]);
    //   });

    // var start;
    // var end;

    // if (brush.extent()[0] != brush.extent()[1]) {
    //   start = selected[0];
    //   end = selected[selected.length - 1] + 1;
    // } else {
    //   start = 0;
    //   end = data.length;
    // }

    // var updatedData = data.slice(start, end);

    // update(updatedData);
    // enter(updatedData);
    // exit(updatedData);
    // updateScale(updatedData)


  }

}
