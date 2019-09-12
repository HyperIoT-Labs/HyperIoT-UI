import { Component, OnInit, ViewChild } from '@angular/core';
import { TreeDataNode } from '@hyperiot/components';
import { HprojectsService, HProject, HdevicesService, HDevice, HpacketsService, HPacket } from '@hyperiot/core';
import { HytTreeViewProjectComponent } from '@hyperiot/components/lib/hyt-tree-view-project/hyt-tree-view-project.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectDataComponent } from './project-data/project-data.component';
import { DeviceDataComponent } from './device-data/device-data.component';
import { PacketDataComponent } from './packet-data/packet-data.component';

@Component({
  selector: 'hyt-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  @ViewChild('treeView', {static: true}) treeView: HytTreeViewProjectComponent;

  treeData: TreeDataNode[] = [];
  private projectId: 0;

  constructor(
    private hProjectService: HprojectsService,
    private hDeviceService: HdevicesService,
    private packetService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.projectId = this.activatedRoute.snapshot.params.projectId;
    this.hProjectService.findAllHProject().subscribe((list: HProject[]) => {
      list.forEach((p) => {
        const projectNode: TreeDataNode = {
          data: {id: p.id},
          name: p.name,
          icon: 'work',
          children: []
        };
        this.treeData.push(projectNode);

        this.packetService.findAllHPacket().subscribe((packetList: HPacket[]) => {

          this.hDeviceService.findAllHDevice().subscribe((deviceList: HDevice[]) => {
            deviceList.forEach((d) => {
              if (d.project && d.project.id === p.id) {
                projectNode.children.push({
                  data: {id: d.id, type: 'device'},
                  name: d.deviceName,
                  icon: 'devices_other',
                  children: packetList
                    .filter((k) => k.device && k.device.id === d.id)
                    .map((k) => {
                      return {
                        data: {id: k.id, type: 'packet'},
                        name: k.name,
                        icon: 'settings_ethernet'
                      };
                    }
                  ) as TreeDataNode[]
                });
              }
            });
            this.treeView.setData(this.treeData);
            if (this.treeView.treeControl.dataNodes.length > 0) {
              this.treeView.treeControl.expand(this.treeView.treeControl.dataNodes[0]);
            }
          });
        });

      });
    });
  }

  onActivate(childComponent) {
    /*
    console.log(childComponent);
    if (childComponent instanceof ProjectDataComponent) {
    } else if (childComponent instanceof DeviceDataComponent) {
    } else if (childComponent instanceof PacketDataComponent) {
    }
    */
  }

  onNodeClick(node) {
    if (node.data && node.data.type) {
      this.router.navigate(
        [ { outlets: {projectDetails: [node.data.type, node.data.id]} } ],
        { relativeTo: this.activatedRoute }
      );
    } else {
      this.router.navigate(
        [ './', { outlets: {projectDetails: null} } ],
        { relativeTo: this.activatedRoute }
      );
    }
  }
}
