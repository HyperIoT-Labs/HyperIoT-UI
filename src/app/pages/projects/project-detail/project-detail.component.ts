import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, zip, Observer } from 'rxjs';

import { HprojectsService, HProject, HdevicesService, HDevice, HpacketsService, HPacket, HPacketField, Rule } from '@hyperiot/core';
import { TreeDataNode } from '@hyperiot/components';

import { HytTreeViewProjectComponent } from '@hyperiot/components/lib/hyt-tree-view-project/hyt-tree-view-project.component';
import { ProjectDetailEntity } from './project-detail-entity';
import { MatDialog } from '@angular/material';
import { SaveChangesDialogComponent } from 'src/app/components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { PacketEnrichmentsDataComponent } from './packet-enrichments-data/packet-enrichments-data.component';

enum TreeStatusEnum {
  Ready,
  Loading,
  LoadingComplete,
  Error
}

@Component({
  selector: 'hyt-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetailComponent implements OnInit {
  @ViewChild('treeView', { static: true }) treeView: HytTreeViewProjectComponent;

  hintMessage = '';
  hintVisible = false;

  TreeStatus = TreeStatusEnum;
  treeStatus = TreeStatusEnum.Ready;

  treeData: TreeDataNode[] = [];
  currentNode;

  private focusTimeout: any = null;
  private projectId: 0;

  projectName: string;
  validationErrors: [];

  constructor(
    private hProjectService: HprojectsService,
    private hDeviceService: HdevicesService,
    private packetService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.projectId = this.activatedRoute.snapshot.params.projectId;
    this.refresh();
  }

  currentEntity: ProjectDetailEntity = null;
  onActivate(childComponent: ProjectDetailEntity) {
    if (childComponent.isProjectEntity) {
      this.currentEntity = childComponent;
      this.currentEntity.projectHost = this;
    }
  }

  onSaveClick() {
    this.validationErrors = [];
    this.currentEntity.save((res) => {
      // TODO: ...
    }, (err) => {
      // TODO: ...
    });
  }

  onDeleteClick() {
    this.openDeleteDialog();
  }

  onSummaryItemClick(rule: Rule) {
    console.log('clicked rule', rule);
  }

  refresh() {
    this.treeStatus = TreeStatusEnum.Loading;
    this.treeData = [];
    this.hProjectService.findHProject(+this.projectId).subscribe((p: HProject) => {
        const projectNode: TreeDataNode = {
          data: { id: p.id },
          name: p.name,
          icon: 'icon-hyt_projectRSolo',
          children: []
        };
        this.projectName = p.name;
        this.treeData.push(projectNode);
        this.treeView.setData(this.treeData);
        this.hDeviceService.findAllHDeviceByProjectId(p.id).subscribe((deviceList: HDevice[]) => {
          const requests: Observable<any>[] = [];
          const devices = []; // device lookup list
          deviceList.map((d) => {
            const node = {
              data: { id: d.id, type: 'device' },
              name: d.deviceName,
              icon: 'icon-hyt_device'
            };
            devices[d.id] = node;
            projectNode.children.push(node);
            requests.push(this.packetService.getHDevicePacketList(d.id));
          });
          zip(...requests).subscribe((packetList: Array<HPacket[]>) => {
            packetList.map((kd: HPacket[]) => {
              if (kd.length === 0) {
                return;
              }
              const d = kd[0].device;
              devices[d.id].children = kd.map((k) => {
                return {
                  data: { id: k.id, type: 'packet' },
                  name: k.name,
                  icon: 'icon-hyt_packets',
                  children: [
                    {
                      data: { id: k.id, type: 'packet-fields' },
                      name: 'Fields',
                      icon: 'icon-hyt_fields'
                    },
                    {
                      data: { id: k.id, type: 'packet-enrichments' },
                      name: 'Enrichments',
                      icon: 'icon-hyt_enrichments'
                    },
                    {
                      data: { id: k.id, type: 'packet-statistics' },
                      name: 'Statistics',
                      icon: 'icon-hyt_statistics'
                    },
                    {
                      data: { id: k.id, type: 'packet-events' },
                      name: 'Events',
                      icon: 'icon-hyt_event'
                    }
                  ]
                };
              });
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
      ).then((success) => {
        if (!success) {
          // reposition on last selected node if navigation is cancelled
          this.treeView.setActiveNode(this.currentNode);
        }
      });
    } else {
      this.router.navigate(
        ['./', { outlets: { projectDetails: null } }],
        { relativeTo: this.activatedRoute }
      ).then((success) => {
        if (!success && this.currentNode) {
          // reposition on last selected node if navigation is cancelled
          this.treeView.setActiveNode(this.currentNode);
        }
      });
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
    const node = this.currentNode = this.find(data);
    if (node) {
      this.treeView.setActiveNode(node);
      let n = node.parent;
      while (n) {
        const np = this.find(n.data);
        tc.expand(np);
        n = np.parent;
      }
    }
  }

  updateNode(data) {
    // refresh treeview node data
    const node = this.find(data);
    node.name = data.name;
    this.focus(data);
  }

  openSaveDialog(): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      const dialogRef = this.dialog.open(SaveChangesDialogComponent, {
        data: {title: 'Discard changes?', message: 'There are pending changes to be saved.'}
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'save') {
          this.validationErrors = [];
          this.currentEntity.save((res) => {
            observer.next(true);
            observer.complete();
          }, (err) => {
            observer.next(false);
            observer.complete();
          });
        } else {
          observer.next(result === 'discard' || result === 'save');
          observer.complete();
        }
      });
    });
  }
  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {title: 'Delete item?', message: 'This operation cannot be undone.'}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.currentEntity.delete((res) => {
          // TODO: ...
        }, (err) => {
          // TODO: report error
        });
      }
    });
  }

  showHintMessage(message: string) {
    this.hintMessage = message;
    this.hintVisible = true;
  }
  hideHintMessage() {
    this.hintVisible = false;
  }

}
