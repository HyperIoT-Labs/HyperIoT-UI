import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { HprojectalgorithmsService, HProjectAlgorithm, HProjectAlgorithmConfig } from '@hyperiot/core';


@Component({
  selector: 'hyt-algorithm-select',
  templateUrl: './algorithm-select.component.html',
  styleUrls: ['./algorithm-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AlgorithmSelectComponent implements OnInit {

  @Input() widget;
  @Input() selectedHProjectAlgorithm: HProjectAlgorithm = null;

  hProjectAlgorithmList: HProjectAlgorithm[] = [];

  constructor(
    private hProjectAlgorithmsService: HprojectalgorithmsService,
    public settingsForm: NgForm
  ) { }

  ngOnInit() {
    this.loadAlgorithms();
  }

  onAlgorithmChange() {
  }


  apply() {
    if (this.selectedHProjectAlgorithm) {
      this.widget.config.hProjectAlgorithmId = this.selectedHProjectAlgorithm.id;
      this.widget.config.hProjectAlgorithmName = this.selectedHProjectAlgorithm.name;
      const config: HProjectAlgorithmConfig = JSON.parse(this.selectedHProjectAlgorithm.config);
      this.widget.config.outputFields = config.output.map(o => o.name);
    }
  }

  algorithmCompare(a1: HProjectAlgorithm, a2: HProjectAlgorithm) {
    return a1 != null && a2 != null && a1.id === a2.id;
  }

  loadAlgorithms() {
    // fetch all algorithms
    this.hProjectAlgorithmsService.findByHProjectId(this.widget.projectId)
      .subscribe( hProjectAlgorithmList => {
        this.hProjectAlgorithmList = hProjectAlgorithmList;
        if (this.widget.config && this.widget.config.hProjectAlgorithmId) {
          // set previous algorithm if widget has been already configured
          this.selectedHProjectAlgorithm = 
            this.hProjectAlgorithmList.find(x => x.id === this.widget.config.hProjectAlgorithmId)
        }
      });
  }

}
