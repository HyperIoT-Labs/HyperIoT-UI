import {Component, OnInit} from '@angular/core';
import {CoordinatesType} from "../../models/coordinates-type";
import {MatButtonToggleChange} from "@angular/material/button-toggle";
import {Logger, LoggerService} from "core";

@Component({
  selector: 'hyt-dynamic-map-user-configurator',
  templateUrl: './dynamic-map-user-configurator.component.html',
  styleUrls: ['./dynamic-map-user-configurator.component.scss']
})
export class DynamicMapUserConfiguratorComponent implements OnInit {
  /**
   * Value used to indicate the type of coordinates the user wants to enter and set via toggle buttons
   */
  selectedCoordType: CoordinatesType = CoordinatesType.GEOCODING;
  /*
   * logger service
   */
  private logger: Logger;

  constructor(private loggerService: LoggerService) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('DynamicMapUserConfiguratorComponent');
  }

  ngOnInit(): void {
  }

  /**
   * Handles the change of value when the toggle button is clicked
   * @param change
   */
  changeCoordType(change: MatButtonToggleChange) {
    this.logger.debug('changeCoordType - Coordinates type has changed', change);
    this.selectedCoordType = change.value;
  }

}
