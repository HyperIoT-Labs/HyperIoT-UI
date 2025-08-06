
/*
 *
 *  * Copyright 2019-2023 HyperIoT
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License")
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *  *
 *
 */

import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {Area, Area_Service, HProjectService, Logger, LoggerService} from 'core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {PageStatus} from '../../../../../models/pageStatus';

@Component({
  selector: 'hyt-areas-list',
  templateUrl: './areas-list.component.html',
  styleUrls: ['./areas-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AreasListComponent implements OnChanges, OnDestroy {
  /**
   * Output event on click of the element inside the selected area
   */
  @Output() itemSelected = new EventEmitter<Area>();
  /**
   * ID of current project
   */
  @Input() projectId: number;
  /**
   * Variable used to indicate if we are in a form
   */
  @Input() isInFormArea?: boolean;
  /**
   * variable used to contain a list of sub areas
   */
  @Input() subAreaList?: Area[];
  /**
   * variable used to indicate if we are in a list of sub areas
   */
  @Input() isSubAreaList?: boolean;
  /**
   * Init value of Pagestatus
   */
  pageStatus: PageStatus = PageStatus.Ready;
  /**
   * variable used to contain a list area object
   */
  areaList: Area[] = [];
  /**
   * Total count of device present in the current area
   */
  deviceCount = 0;
  /**
   * Total count of sub-areas present in the current area
   */
  innerAreaCount = 0;
  /**
   * Subject for manage the open subscriptions
   * @protected
   */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  /*
  * logger service
  */
  private logger: Logger;
  constructor(
    private projectService: HProjectService,
    private areaService: Area_Service,
    private loggerService: LoggerService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('AreaListComponent');
  }
  ngOnChanges(changes: SimpleChanges) {
    this.logger.debug('Changed input values', changes);
    if(this.ngUnsubscribe){
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
    if(this.subAreaList){
      this.logger.debug('We are in a sub-area, we receive the list to be displayed as input', this.subAreaList);
      this.areaList = this.subAreaList;
    } else {
      this.logger.debug('We are in a main area, we start the search function for Areas');
      this.getAreasList();
    }
  }
  ngOnDestroy() {
    if(this.ngUnsubscribe){
      this.logger.debug('Closed all subscriptions of the component');
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  /**
   * Method that outputs the value of the clicked area to the parent component
   * @param area // Clicked Area
   */
  onAreaItemClick(area: Area) {
    this.logger.debug('Area clicked', area)
    this.itemSelected.emit(area);
  }

  /**
   * Get of the list of areas and counting of the elements contained therein
   * @private
   */
  private getAreasList() {
    this.pageStatus = PageStatus.Loading;
    this.resetAreaCounter();
    this.projectService.getHProjectAreaList(this.projectId).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (list: Area[]) => {
        this.areaList = list;
        list.forEach((a) => {
          this.countInnerArea(a);
          this.countAreaDevice(a);
        })
        this.logger.debug('getAreasList values returned', list);
        this.pageStatus = PageStatus.Ready;
      },
      error: (error) => {
        this.logger.error('getAreasList error', error);
        this.pageStatus = PageStatus.Error;
      }
    });
  }

  /**
   * Total count of sub-areas of an area
   * @param area
   * @private
   */
  private countInnerArea(area: Area) {
    this.areaService.findInnerAreas(area.id).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(
      {
        next: (areaTree) => {
          const count = (list: Area[]): number => {
            let sum = list.length;
            list.forEach((a) => { sum += count(a.innerArea); });
            return sum;
          };
          this.innerAreaCount = area['innerCount'] = count(areaTree.innerArea);
          this.logger.debug('Total inner areas', this.innerAreaCount);
        },
        error: (error) => {
          this.logger.error('Find Inner Area Error', error);
          this.innerAreaCount = -1;
        }
      })
  }

  /**
   * Total count of devices of an area
   * @param area
   * @private
   */
  private countAreaDevice(area: Area) {
    this.areaService.getAreaDeviceDeepList(area.id).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: (deviceList) => {
        this. deviceCount = area['deviceCount'] = deviceList.length;
        this.logger.debug('Total Device in area', this.deviceCount);
      },
      error: (error) => {
        this.logger.error('Count device in Area Error', error);
        this.deviceCount = -1;
      }
    });
  }

  /**
   * Reset count of sub-areas and devices of an area
   * @private
   */
  private resetAreaCounter(): void {
    this.deviceCount = 0;
    this.innerAreaCount = 0;
  }

  /**
   * Function that manages the elevation effect of a card of an area on mouseover
   * @param e
   */
  toggleClassCard(e): void {
    const classElIsIn = e.target.classList.contains('mat-elevation-z2');
    const cl = e.target.classList;
    if(classElIsIn) {
      cl.remove('mat-elevation-z2');
      cl.add('mat-elevation-z8')
    }else{
      cl.remove('mat-elevation-z8');
      cl.add('mat-elevation-z2')
    }
  }
}
