import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';
import { Algorithm, AlgorithmConfig, AlgorithmIOField, HPacketField, HProjectAlgorithmConfig, HProjectAlgorithmInputField, MappedInput } from '@hyperiot/core';
import { eventNames } from 'process';


interface ChosenInput {
  input: AlgorithmIOField,
  hPacketField: HPacketField[]
}

@Component({
  selector: 'hyt-input-definition-modal',
  templateUrl: './input-definition-modal.component.html',
  styleUrls: ['./input-definition-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InputDefinitionModalComponent extends HytModal implements OnInit {
  
  /**
   * The selected algorithm
   */
  algorithm: Algorithm;
  /**
   * Base configuration of algorithm
   */
  algorithmBaseConfig: AlgorithmConfig;
  /**
   * This variable contains algorithm input fields
   */
  inputArray: Array<AlgorithmIOField>;
  /**
   * This variable contains available packet fields which could be bound to algoritm input fields
   */
  hPacketFieldList: HPacketField[];
  /**
   * It contains association between algorithm input fields and selected packet fields
   */
  chosenInputList: ChosenInput[];

  /**
   * Index of input. We need this to update an existing input
   */
  inputIndex: number;

  /**
   * This is the mapping between algorithm inputs and fields of a packet
   */
  mappedInputList: MappedInput[];

  panelOpenState: boolean;
  searchText: string;

  constructor(hytModalService: HytModalService) {
    super(hytModalService);
    this.chosenInputList = [];
    this.panelOpenState = false;
    this.searchText = '';
  }

  ngOnInit(): void {
    this.algorithm = this.data.algorithm;
    this.algorithmBaseConfig = JSON.parse(this.data.algorithm.baseConfig);
    this.inputArray = this.algorithmBaseConfig.input;
    // deep copy of available packet fields
    this.hPacketFieldList = [...this.data.hPacketFieldList];
    this.mappedInputList = this.data.mappedInputList.length === 0 ? [] : JSON.parse(this.data.mappedInputList);
    this.buildChosenInputList();
  }

  private buildChosenInputList(): void {
    if (Object.keys(this.mappedInputList).length > 0) {
      // edit mode, load previous input

      /**
       * A brief explaination about whats is going on here.
       * From backend, we receive a configuration data stucture like this:
       * {
       *    "input": [
       *      {
       *        "packetId": <packetId>,
       *        "mappedInputList": [
       *          {
       *            "packetFieldId": <packetFieldId>,
       *            "algorithmInput" : {
       *              <AlgoritmIOField_model>
       *             }
       *          },
       *          ...
       *        ]
       *      }
       *    ],
       *    "output": [...]
       * }
       *
       * On frontend, to accomplish on Angular Material properties on drag and drop component, we need a different data structure, like this one:
       * [
       *  {
       *    "input": {
       *      <AlgoritmIOField_model>
       *    },
       *    "hPacketField": [{
       *      <HPacketField_model>
       *    }]
       *  },
       *  ...
       * ]
       *
       * For every algorithm input, we bind one HPacketField. However, we need an array of HPacketField (see hPacketFieldList variable on template).
       * This list contains one element at most
       *
       * The following lines of code make the conversion between the two previous described data structures
       *
       * Of course, when this modal will be close, there is the opposite conversion (see method output)
       */

      this.mappedInputList.forEach( mappedInput => {
        const packetFieldId: number = mappedInput.packetFieldId;
        const chosenInput: ChosenInput = {
          input: mappedInput.algorithmInput,
          hPacketField: [this.hPacketFieldList.find(x =>  x.id === packetFieldId)]
        };
        this.hPacketFieldList.forEach((x, index) => {
          if (x.id === chosenInput.hPacketField[0].id) {
            this.hPacketFieldList.splice(index, 1);
          }
        });
        for (let i=0; i<this.hPacketFieldList.length; i++) {
          if (this.hPacketFieldList[i].id === chosenInput.hPacketField[0].id) {
            this.hPacketFieldList.splice(i, 1);
          }
        }
        this.chosenInputList.push(chosenInput);
      })
    } else {
      this.inputArray.forEach(i => this.chosenInputList.push({
        input: i,
        hPacketField: []
      }));
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
    this.searchText = '';
  }

  getChosenInput(input: AlgorithmIOField): HPacketField[] {
    return this.chosenInputList.find(x => x.input.id === input.id).hPacketField;
  }

  hasBeenSelected(): boolean {
    console.log('HASBEENSELECTED', this.data)
    console.log('HASBEENSELECTED LENGTH', this.data.length)
    return this.data.length === 0;
  }

  hasFinished(): boolean {
    return this.chosenInputList.every(chosenInput => chosenInput.hPacketField.length > 0);
  }

  output(action: string, data: any) {
    // do the conversion between frontend data structure and backend one
    const mappedInputList = [];
    this.chosenInputList.forEach(x => {
      mappedInputList.push({packetFieldId: x.hPacketField[0].id, algorithmInput: x.input});
    });
    data.mappedInputList = mappedInputList;
    this.close({ action, data });
  }
  
  /**
   * this method is used to override zindex paramenter for dragged element
   * @param event 
   */
  onDragStarted(event: CdkDragStart): void {
    
    let fisrtMove: boolean = true; 
    event.source.moved.subscribe((res)=> {
      if(fisrtMove){
        let zIndexSerial: number = 10000;
        let preview: HTMLElement = document.querySelector('.cdk-drag.example-box.cdk-drag-preview');
        preview.style.zIndex = zIndexSerial+"";
        fisrtMove = false;
      }
    })
    
  }
  

}
