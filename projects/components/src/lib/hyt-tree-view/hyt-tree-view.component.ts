import { Component, OnInit, Input } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource, MatTreeFlatDataSource } from '@angular/material/tree';

/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
export interface TreeNode {
  name: string;
  children?: TreeNode[];
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hyt-tree-view',
  templateUrl: './hyt-tree-view.component.html',
  styleUrls: ['./hyt-tree-view.component.scss']
})
export class HytTreeViewComponent implements OnInit {

  @Input() treeData: TreeNode[];

  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  constructor() {
  }

  ngOnInit() {
    this.dataSource.data = this.treeData;
  }

  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;
}
