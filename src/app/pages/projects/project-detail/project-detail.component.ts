import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, zip } from 'rxjs';

import { HprojectsService, HProject, HdevicesService, HDevice, HpacketsService, HPacket } from '@hyperiot/core';
import { TreeDataNode } from '@hyperiot/components';

import { HytTreeViewProjectComponent } from '@hyperiot/components/lib/hyt-tree-view-project/hyt-tree-view-project.component';

enum TreeStatusEnum {
  Ready,
  Loading,
  LoadingComplete,
  Error
}

@Component({
  selector: 'hyt-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  @ViewChild('treeView', { static: true }) treeView: HytTreeViewProjectComponent;

  TreeStatus = TreeStatusEnum;
  treeStatus = TreeStatusEnum.Ready;

  treeData: TreeDataNode[] = [];

  private focusTimeout: any = null;
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
    this.refresh();
  }

  onActivate(childComponent) {
    if (childComponent.treeHost === null) {
      childComponent.treeHost = this;
    }
  }

  refresh() {
    this.treeStatus = TreeStatusEnum.Loading;
    this.treeData = [];
    this.hProjectService.findHProject(+this.projectId).subscribe((p: HProject) => {
        const projectNode: TreeDataNode = {
          data: { id: p.id },
          name: p.name,
          icon: 'work',
          children: []
        };
        this.treeData.push(projectNode);
        this.treeView.setData(this.treeData);
        this.hDeviceService.findAllHDevice(p.id).subscribe((deviceList: HDevice[]) => {
          const requests: Observable<any>[] = [];
          deviceList.map((d) => {
            requests.push(this.packetService.getHDevicePacketList(d.id));
          });
          zip(...requests).subscribe((packetList: Array<HPacket[]>) => {
            packetList.map((kd: HPacket[]) => {
              const d = kd[0].device;
              const node = {
                data: { id: d.id, type: 'device' },
                name: d.deviceName,
                icon: 'devices_other',
                children: kd.map((k) => {
                    return {
                      data: { id: k.id, type: 'packet' },
                      name: k.name,
                      icon: 'settings_ethernet'
                    };
                  }
                  ) as TreeDataNode[]
              };
              projectNode.children.push(node);
            });
            this.treeView.setData(this.treeData);
            if (this.treeView.treeControl.dataNodes.length > 0) {
              this.treeView.treeControl.expand(this.treeView.treeControl.dataNodes[0]);
            }
            this.treeStatus = TreeStatusEnum.Ready;
          }, (err) => {
            this.treeStatus = TreeStatusEnum.Error;
          });
          if (requests.length === 0) {
            this.treeStatus = TreeStatusEnum.Ready;
          }
        }, (err) => {
          this.treeStatus = TreeStatusEnum.Error;
        });
    }, (err) => {
      this.treeStatus = TreeStatusEnum.Error;
    });
  }

  onNodeClick(node) {
    if (node.data && node.data.type) {
      this.router.navigate(
        [{ outlets: { projectDetails: [node.data.type, node.data.id] } }],
        { relativeTo: this.activatedRoute }
      );
    } else {
      this.router.navigate(
        ['./', { outlets: { projectDetails: null } }],
        { relativeTo: this.activatedRoute }
      );
    }
  }

  find(data: any) {
    return this.treeView
      .treeControl
      .dataNodes.find((d) => d.data.id === data.id && d.data.type === data.type);
  }

  focus(data) {
    if (this.treeStatus !== TreeStatusEnum.Ready) {
      if (this.focusTimeout !== null) {
        clearTimeout(this.focusTimeout);
      }
      this.focusTimeout = setTimeout( () => {
        this.focus(data);
      }, 100);
      return;
    }
    // refresh treeview node data
    const tc = this.treeView.treeControl;
    const node = this.find(data);
    this.treeView.setActiveNode(node);
    let n = node.parent;
    while (n) {
      const np = this.find(n.data);
      tc.expand(np);
      n = np.parent;
    }
  }

  updateNode(data) {
    // refresh treeview node data
    const node = this.find(data);
    node.name = data.name;
    this.focus(data);
  }
}
