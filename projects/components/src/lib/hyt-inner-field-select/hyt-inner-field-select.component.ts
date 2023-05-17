import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { HPacketField, HPacketFieldsHandlerService } from 'core';

@Component({
  selector: 'hyt-inner-field-select',
  templateUrl: './hyt-inner-field-select.component.html',
  styleUrls: ['./hyt-inner-field-select.component.css']
})
export class HytInnerFieldSelectComponent implements OnChanges, OnInit {

  @Input() fields: HPacketField[] = [];
  @Input() selectedFieldsIds: number[] = [];
  @Input() isMultiSelect = false;

  fieldsOption = [];

  treeControl = new NestedTreeControl<HPacketField>(field => field.innerFields);
  dataSource = new MatTreeNestedDataSource<HPacketField>();

  @Output() fieldSelectionChanged: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor(
    private hPacketFieldsHandlerService: HPacketFieldsHandlerService
  ) { }

  findTreePathToField(fields: HPacketField[], targetField: HPacketField, path: HPacketField[] = []): HPacketField[] | null {
    for (const field of fields) {
      if (field === targetField) {
        return [...path, field];
      }
      if (field.innerFields) {
        const foundPath = this.findTreePathToField(field.innerFields, targetField, [...path, field]);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
  }

  expandTreePathToField(field: HPacketField) {
    const treePath: HPacketField[] | null = this.findTreePathToField(this.dataSource.data, field);
    if (treePath) {
      treePath.forEach(field => this.treeControl.expand(field));
    }
  }

  sortFields(fields: HPacketField[]): HPacketField[] {
    return fields
      .sort((a, b) => {
        // Sort fields with children above fields without children
        if (a.innerFields.length && !b.innerFields.length) {
          return -1;
        } else if (!a.innerFields.length && b.innerFields.length) {
          return 1;
        }
        // Sort fields alphabetically by name
        return a.name.localeCompare(b.name)
      })
      .map(field => {
        if (field.innerFields) {
          field.innerFields = this.sortFields(field.innerFields);
        }
        return field;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const sortedFields = this.sortFields(this.fields)
    this.dataSource.data = sortedFields;
    if (this.selectedFieldsIds.length > 0) {
      this.selectedFieldsIds.forEach(fieldId => {
        this.expandTreePathToField(this.hPacketFieldsHandlerService.findFieldFromFieldsTree(this.fields, fieldId));
      });
    }
    const fieldsFlatList = this.hPacketFieldsHandlerService.flatFieldsTree(this.fields);
    this.fieldsOption = fieldsFlatList.map(x => ({
      value: x.field.id,
      label: x.label
    }));
  }

  ngOnInit(): void { }

  hasChild = (_: number, field: HPacketField) => !!field.innerFields && field.innerFields.length > 0;
  isChecked = (field: HPacketField) => this.selectedFieldsIds.some(fId => fId === field.id);
  isDisabled = (field: HPacketField) => {
    if (this.isMultiSelect) {
      return false;
    } else if (this.selectedFieldsIds.length === 0) {
      return false;
    } else if (this.isChecked(field)) {
      return false;
    }
    return true;
  }

  itemSelectToggle(field: HPacketField) {
    if (this.selectedFieldsIds.some(fId => fId === field.id)) {
      this.selectedFieldsIds = this.selectedFieldsIds.filter(fId => fId !== field.id);
    } else {
      this.selectedFieldsIds.push(field.id);
    }
    this.selectedFieldsIds = [...this.selectedFieldsIds];
    this.fieldSelectionChanged.emit(this.selectedFieldsIds);
  }
}
