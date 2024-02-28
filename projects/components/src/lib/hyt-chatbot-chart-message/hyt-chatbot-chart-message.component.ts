import { Component, Input, Optional, ViewEncapsulation } from "@angular/core";
import { PlotlyService } from 'angular-plotly.js';
import * as d3 from 'd3';
import { from } from "rxjs";
import { DialogService } from "../hyt-dialog/dialog.service";
import { HytChartModalComponent } from "../hyt-modal/hyt-chart-modal/hyt-chart-modal.component";

@Component({
  selector: "hyt-chatbot-chart-message",
  templateUrl: "./hyt-chatbot-chart-message.component.html",
  styleUrls: ["./hyt-chatbot-chart-message.component.scss"],
  encapsulation: ViewEncapsulation.None,
})

export class HytChatbotChartMessageComponent {

  // Data used to generate chart
  @Input() data : string;

  // Type of chart to draw
  @Input() type: string;


  // Chart variables
  chartData: any;
  chartLayout: any;

  constructor(@Optional() public plotly: PlotlyService,
              private dialogService: DialogService) {
  }

  ngOnInit(){

    // Transform data from string into JSON
    let data_JSON = JSON.parse(this.data);

    let newData = [{
      x: data_JSON["x"],
      y: data_JSON["y"],
      type: this.type
    }]

    this.chartData = newData;
    this.chartLayout = { title: 'Chart'}; // default

    // Create preview Image
    var img_jpg= d3.select('#jpg-export');
    let image = document.getElementById('plotImage') as HTMLDivElement;
    this.plotly.newPlot(image, newData, this.chartLayout)
      .then((gd) => 
        from(this.plotly.getPlotly()).subscribe(res => {
          res.toImage(gd, {})
            .then(function(url) {
              img_jpg.attr("src", url);
            })
    }));
  }

  openModal() {
    this.dialogService.open(HytChartModalComponent, { backgroundClosable: true, data: this.chartData });
  }

}