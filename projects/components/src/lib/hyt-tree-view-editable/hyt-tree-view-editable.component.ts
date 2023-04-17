import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

export class Node {
  name: string;
  data: any;
  root: boolean;
  lom: string;
  type: string;
  children?: Node[];
}

export class FlatNode {
  name: string;
  data: any;
  root: boolean;
  lom: string;
  type: string;
  level: number;
  expandable: boolean;
}

/**
 * Node database, it can build a tree structured Json object.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class NodeDatabase {

  dataChange = new BehaviorSubject<Node[]>([]);

  get data(): Node[] { return this.dataChange.value; }

  constructor() {
  }

  public initialize(treeData: any, deviceName: string) {
    const root: Node[] = [{
      name: deviceName,
      data: null,
      root: true,
      lom: 'L.O.M.',
      type: 'TYPE',
      children: treeData
    }];
    const data = this.buildFileTree(root, 0);
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: { [key: string]: any }, level: number): Node[] {
    const nodeList: Node[] = [];
    for (const i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        const newNode = new Node();
        const node = obj[i];
        newNode.name = node.name;
        newNode.data = node.data;
        newNode.root = node.root;
        newNode.lom = node.lom;
        newNode.type = node.type;
        if (node.children) {
          newNode.children = this.buildFileTree(node.children, level + 1);
        }
        nodeList.push(newNode);
      }
    }

    return nodeList;
  }

  /** Add an item to to-do list */
  insertItem(parent: Node, name: string, lom: string, type: string, data: any, root: boolean) {
    if (parent.children) {
      parent.children.push({ name, lom, type, data, root } as Node);
      this.dataChange.next(this.data);
    }
  }

  /** Add an item to to-do list */
  removeItem(parent: Node, name: string) {
    if (parent.children) {
      parent.children.forEach((node, index) => {
        if (node.name === name) {
          parent.children.splice(index, 1);
        }
      });
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: Node, name: string, lom: string, type: string, data: any, root: boolean) {
    node.name = name;
    node.lom = lom;
    node.type = type;
    node.data = data;
    node.root = root;
    this.dataChange.next(this.data);
  }
}

@Component({
  selector: 'hyt-tree-view-editable',
  templateUrl: './hyt-tree-view-editable.component.html',
  styleUrls: ['./hyt-tree-view-editable.component.scss'],
  providers: [NodeDatabase],
  encapsulation: ViewEncapsulation.None
})
export class HytTreeViewEditableComponent implements OnInit {

  @ViewChild('editableTree') private Element: ElementRef;

  @Input() deviceName: string;

  tree: any;
  @Input()
  get treeData(): any {
    return this.tree;
  }
  set treeData(t: any) {
    this.tree = t;
  }

  @Output() removeFn: EventEmitter<any> = new EventEmitter();

  @Output() addFn: EventEmitter<any> = new EventEmitter();

  @Output() editFn: EventEmitter<any> = new EventEmitter();

  //@Output() cancelFn: EventEmitter<any> = new EventEmitter();

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<FlatNode, Node>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<Node, FlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: FlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<FlatNode>;

  treeFlattener: MatTreeFlattener<Node, FlatNode>;

  dataSource: MatTreeFlatDataSource<Node, FlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<FlatNode>(true /* multiple */);

  status = 'idle';

  constructor(private database: NodeDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<FlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this.database.initialize(this.tree, this.deviceName);
  }

  getLevel = (node: FlatNode) => node.level;

  isExpandable = (node: FlatNode) => node.expandable;

  getChildren = (node: Node): Node[] => node.children;

  hasChild = (_: number, nodeData: FlatNode) => nodeData.expandable;

  hasNoContent = (_: number, nodeData: FlatNode) => nodeData.name === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: Node, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new FlatNode();
    flatNode.name = node.name;
    flatNode.lom = node.lom;
    flatNode.type = node.type;
    flatNode.data = node.data;
    flatNode.root = node.root;
    flatNode.level = level;
    flatNode.expandable = !((node.children == null) || (node.children === []));
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: FlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: FlatNode): void {
    let parent: FlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: FlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: FlatNode) {
    const parentNode: Node = this.flatNodeMap.get(node);
    if (this.status !== 'nodeInsertion') {
      //this.status = 'nodeInsertion';
      //this.database.insertItem(parentNode!, '', '', '', 0, false);
      //this.treeControl.expand(node);
      this.addFn.emit(parentNode);
    }
  }

  removeItem(flatNode: FlatNode) {
    // const parentNodeFlat = this.getParentNode(flatNode);
    // const parentNode: Node = this.flatNodeMap.get(parentNodeFlat);
    // this.database.removeItem(parentNode, flatNode.name);
    const node = this.flatNodeMap.get(flatNode);
    this.treeControl.expand(flatNode);
    this.removeFn.emit(node);
  }

  removed(node: Node) {
    const flatNode = this.nestedNodeMap.get(node);
    const parentNodeFlat = this.getParentNode(flatNode);
    const parentNode: Node = this.flatNodeMap.get(parentNodeFlat);
    this.database.removeItem(parentNode, flatNode.name);
    this.status = 'idle';
  }

  modifyItem(flatNode: FlatNode) {
    const node = this.flatNodeMap.get(flatNode);
    this.status = 'idle';
    this.editFn.emit(node);
  }

  refresh(treeData: any, deviceName: string) {
    this.database.initialize(treeData, deviceName);
    this.treeControl.expandAll();
    this.status = 'idle';
  }
/*
  cancelInsertion(flatNode: FlatNode) {
    const parentNodeFlat = this.getParentNode(flatNode);
    const parentNode: Node = this.flatNodeMap.get(parentNodeFlat);
    this.database.removeItem(parentNode, flatNode.name);
    this.status = 'idle';
    this.cancelFn.emit(parentNode);
  }
*/

/** Save the node to database */
  saveNode(node: FlatNode, name: string, lom: string, type: string, data: any, root: boolean) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode!, name, lom, type, data, root);
  }
}
