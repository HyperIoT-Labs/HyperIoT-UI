import { Component, EventEmitter, Input, Optional, Output, ViewEncapsulation } from "@angular/core";
import { PlotlyService } from 'angular-plotly.js';
import * as d3 from 'd3';
import { from } from "rxjs";
import { DialogService } from "../hyt-dialog/dialog.service";

// Modal Component
@Component({
  selector: 'hyt-chatbot-chart-modal',
  template: `
    <div class="modal">
      <div class="modal-toolbar">
        <div class="modal-toolbar-end">
          <span class="exit-chart" (click)="close()">X</span>
        </div>
      </div>
      <!-- Utilizza plotly-angular per visualizzare il grafico completo -->
      <plotly-plot id="chart" [data]="this.chartData" [layout]="this.chartLayout"></plotly-plot>
    </div>
  `,
    styleUrls: ["./hyt-chatbot-chart-message.component.scss"],
})
export class HytChatbotChartModalComponent {

  // Chart input parameters
  @Input() chartData: any; 
  @Input() chartLayout: any; 

  // Close modal event
  @Output() closeModal = new EventEmitter<void>();

  close(){
    this.closeModal.emit();
  }

}

// Preview Component
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

  // Modal open or not
  isModalOpen: boolean = false;

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
    this.isModalOpen = true;
    //this.dialogService.open(HytChatbotChartModalComponent, { backgroundClosable: true });
  }

  closeModal() {
    this.isModalOpen = false;
  }

}