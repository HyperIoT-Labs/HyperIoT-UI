import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { AlgorithmsService, Algorithm, AlgorithmConfig, HprojectalgorithmsService } from '@hyperiot/core';


@Component({
  selector: 'hyt-algorithm-select',
  templateUrl: './algorithm-select.component.html',
  styleUrls: ['./algorithm-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AlgorithmSelectComponent implements OnInit {

  @Input() widget;
  @Input()
  selectedAlgorithm: Algorithm = null;

  projectAlgorithms: Algorithm[] = [];

  constructor(
    private algorithmsService: AlgorithmsService,
    private hProjectAlgorithmsService: HprojectalgorithmsService,
    public settingsForm: NgForm
  ) { }

  ngOnInit() {
    this.loadAlgorithms();
  }

  onAlgorithmChange() {
  }


  apply() {
    if (this.selectedAlgorithm) {
      this.widget.config.algorithmId = this.selectedAlgorithm.id;
      const config: AlgorithmConfig = JSON.parse(this.selectedAlgorithm.baseConfig);
      this.widget.config.outputFields = config.output.map(o => o.name);
    }
  }

  algorithmCompare(a1: Algorithm, a2: Algorithm) {
    return a1 != null && a2 != null && a1.id === a2.id;
  }

  loadAlgorithms() {
    // fetch all algorithms
    this.hProjectAlgorithmsService.findByHProjectId(this.widget.projectId).subscribe((hProjectAlgorithmList) => {
      hProjectAlgorithmList.map(hProjectAlgorithm => this.projectAlgorithms.push(hProjectAlgorithm.algorithm));
    });
    // set previous algorithm if widget has been already configured
    if (this.widget.config && this.widget.config.algorithmId) {
      this.algorithmsService.findAlgorithm(this.widget.config.algorithmId)
        .subscribe((algorithm: Algorithm) => {
          this.selectedAlgorithm = algorithm;
        });
    }
  }

}
