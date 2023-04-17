import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnChanges } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Observable } from 'rxjs';

export interface TreeNodeCategory {
  id: number;
  label: string;
  data: any;
  active: any;
  children: TreeNodeCategory[];
  parent: TreeNodeCategory;
}

@Component({
  selector: 'hyt-tree-view-category',
  templateUrl: './hyt-tree-view-category.component.html',
  styleUrls: ['./hyt-tree-view-category.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytTreeViewCategoryComponent implements OnChanges {

  @Input()
  treeDataFlat: TreeNodeCategory[] = [];

  @Input()
  mode: string;

  @Input()
  addFunction: (treeNodeCategory) => Observable<TreeNodeCategory>;

  @Input()
  editFunction: (treeNodeCategory) => Observable<TreeNodeCategory>;

  @Input()
  removeFunction: (treeNodeCategory) => Observable<TreeNodeCategory>;

  treeData: TreeNodeCategory[] = [];

  @Output() nodeChecked = new EventEmitter<TreeNodeCategory>();

  treeControl = new NestedTreeControl<TreeNodeCategory>(node => node.children);

  dataSource = new MatTreeNestedDataSource<TreeNodeCategory>();

  constructor() { }

  ngOnChanges() {
    this.createTree();
  }

  createTree() {
    this.treeData = [];
    const lookup = {};
    this.treeDataFlat.forEach((x) => {
      lookup[x.id] = x;
      x.children = [];
    });
    this.treeDataFlat.forEach((x) => {
      if (x.parent != null) {
        lookup[x.parent.id].children.push(x);
      } else {
        this.treeData.push(x);
      }
    });
    this.dataSource.data = this.treeData;
    this.triggerChange();
  }

  hasChild = (_: number, node: TreeNodeCategory) => !!node.children && node.children.length > 0;

  checkChildren(node: TreeNodeCategory) {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        node.children[i].active = node.active;
        this.checkChildren(node.children[i]);
      }
    }
  }

  checkParent(node: TreeNodeCategory) {
    if (node.parent) {
      let countTrue = 0;
      let countFalse = 0;
      let countNull = 0;
      node.parent.children.forEach(children => {
        if (children.active === true) {
          countTrue++;
        } else if (children.active === false) {
          countFalse++;
        } else {
          countNull++;
        }
      });
      if ((countNull > 0) || (countTrue > 0) && (countFalse > 0)) {
        node.parent.active = null;
      } else if (countTrue > 0) {
        node.parent.active = true;
      } else {
        node.parent.active = false;
      }
      this.checkParent(node.parent);
    }
  }

  updateCheckStatus(nodeArray: TreeNodeCategory[]) {
    nodeArray.forEach(node => {
      if (!node.children || node.children.length === 0) {
        this.checkParent(node);
      } else if (node.children) {
        this.updateCheckStatus(node.children);
      }
    });
  }

  cbChanged(node: TreeNodeCategory) {
    if (node.active == null) {
      node.active = true;
    }
    this.checkChildren(node);
    this.checkParent(node);
    this.nodeChecked.emit(node);
  }

  addNodeRec(nodeArray: TreeNodeCategory[], parentNode: TreeNodeCategory, n: TreeNodeCategory) {
    nodeArray.forEach(node => {
      if (node.id === parentNode.id) {
        n.parent = node;
        node.children.push(n);
        this.treeControl.expand(parentNode);
      } else if (node.children) {
        this.addNodeRec(node.children, parentNode, n);
      }
    });
  }

  addNode(parentNode: TreeNodeCategory) {
    this.addFunction(parentNode).subscribe(
      res => {
        if (!parentNode) {
          this.dataSource.data.push(res);
        } else {
          this.addNodeRec(this.treeData, parentNode, res);
        }
        this.triggerChange();
      }
    );
  }

  editNodeRec(nodeArray: TreeNodeCategory[], n: TreeNodeCategory) {
    nodeArray.forEach(node => {
      if (node.id === n.id) {
        const i = nodeArray.indexOf(node);
        nodeArray[i].data = { ...n.data };
        nodeArray[i].label = n.label;
      } else if (node.children) {
        this.editNodeRec(node.children, n);
      }
    });
  }

  editNode(node: TreeNodeCategory) {
    this.editFunction(node).subscribe(
      res => {
        this.editNodeRec(this.treeData, res);
        this.triggerChange();
      }
    );
  }

  removeNodeRec(nodeArray: TreeNodeCategory[], n: TreeNodeCategory) {
    nodeArray.forEach(node => {
      if (node.id === n.id) {
        const i = nodeArray.indexOf(node);
        nodeArray.splice(i, 1);
      } else if (node.children) {
        this.removeNodeRec(node.children, n);
      }
    });
  }

  removeNode(node: TreeNodeCategory) {
    this.removeFunction(node).subscribe(
      res => {
        this.removeNodeRec(this.treeData, node);
        this.triggerChange();
      }
    );
  }

  triggerChange() {
    const data = this.dataSource.data;
    this.dataSource.data = null;
    this.dataSource.data = data;
    this.updateCheckStatus(this.treeData);
  }

}
