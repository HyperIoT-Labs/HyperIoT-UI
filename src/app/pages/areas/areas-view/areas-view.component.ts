import { Component, OnInit, ViewChild } from '@angular/core';
import { AreaMapComponent } from '../../projects/project-forms/areas-form/area-map/area-map.component';
import { HytTreeViewProjectComponent } from '@hyperiot/components/lib/hyt-tree-view-project/hyt-tree-view-project.component';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { AreasService, Area, AreaDevice } from '@hyperiot/core';
import { HytModalService } from '@hyperiot/components';

@Component({
  selector: 'hyt-areas-view',
  templateUrl: './areas-view.component.html',
  styleUrls: ['./areas-view.component.scss']
})
export class AreasViewComponent implements OnInit {
  @ViewChild('map', { static: true })
  mapComponent: AreaMapComponent;
  @ViewChild('treeView', { static: true })
  treeView: HytTreeViewProjectComponent;


  constructor(
    private areaService: AreasService,
    private modalService: HytModalService
  ) { }

  ngOnInit() {
  }

  private configureAreaTree(areaId: number) {
    // load areas tree
    this.areaService.findInnerAreas(areaId).subscribe((areaTree) => {
      // get all devices (including inner areas ones)
      this.areaService.getAreaDeviceDeepList(areaId).subscribe((deviceList) => {
        // add devices to areas tree
        const findArea = (areaList: Area[], id: number): Area => {
          let foundArea: Area;
          for (const a of areaList) {
            if (a.id === id) {
              foundArea = a;
            }
            if (!foundArea) {
              foundArea = findArea(a.innerArea, id);
            }
            if (foundArea) {
              return foundArea;
            }
          }
        };
        deviceList.forEach((ad) => {
          let deviceArea;
          if (areaTree.id === ad.area.id) {
            // found on root area
            deviceArea = areaTree;
          } else {
            // search on innerAreas
            deviceArea = findArea(areaTree.innerArea, ad.area.id);
          }
          if (deviceArea) {
            if (!deviceArea.deviceList) {
              deviceArea.deviceList = [];
            }
            deviceArea.deviceList.push(ad);
          }
        });
        // build treeview data structure from `areaTree`
        const buildTreeConfig = (areas) => {
          const treeConfig = [];
          areas.forEach((a) => {
            const treeArea = {
              data: { id: a.id, type: 'area' },
              name: a.name,
              icon: 'icon-hyt_areaB16',
              // add inner-areas
              children: buildTreeConfig(a.innerArea)
            };
            // add inner-areas count to area name
            if (treeArea.children.length > 0) {
              treeArea.name += ' A: ' + treeArea.children.length;
            }
            // add area devices
            if (a.deviceList && a.deviceList.length > 0) {
              treeArea.children.push(...(a.deviceList.map((ad: AreaDevice) => {
                const d = ad.device;
                return {
                  data: {id: d.id, type: 'device'},
                  name: d.deviceName,
                  icon: 'icon-hyt_device',
                  children: []
                };
              })));
              // add area devices count to area name
              if (a.deviceList.length > 0) {
                treeArea.name += ' D: ' + a.deviceList.length;
              }
            }
            treeConfig.push(treeArea);
          });
          return treeConfig;
        };
        // build tree config
        const config = buildTreeConfig([areaTree]);
// TODO:        this.treeView.setData(config);
      });
    });
  }

}
