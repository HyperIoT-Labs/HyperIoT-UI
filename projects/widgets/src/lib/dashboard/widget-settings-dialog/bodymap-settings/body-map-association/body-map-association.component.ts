import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Option } from 'components';
import { Subject } from 'rxjs';
import { BodyMapAssociation } from '../bodymap.model';

@Component({
  selector: 'hyperiot-body-map-association',
  templateUrl: './body-map-association.component.html',
  styleUrls: ['./body-map-association.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BodyMapAssociationComponent implements OnInit {
  ready = undefined;
  @Input() projectId: number;
  @Input() bodyMap;
  @Input() bodyMapAssociation: BodyMapAssociation;

  @Output() save: EventEmitter<BodyMapAssociation> = new EventEmitter<BodyMapAssociation>();

  muscleListOptions: Option[] = [];
  packetList: string[] = [];

  onSubmit: Subject<BodyMapAssociation> = new Subject<BodyMapAssociation>();

  // dati che arrivano dal modale
  data: any;

  isEditMode = true;

  constructor(
    private httpService: HttpClient,
  ) { }

  ngOnInit(): void {
    if (this.data) {
      // get input data from modal data
      if (this.data.association) {
        this.bodyMapAssociation = this.data.association;
      }
      if (this.data.projectId) {
        this.projectId = this.data.projectId;
      }
      if (this.data.bodyMap) {
        this.bodyMap = this.data.bodyMap;
      }
    }
    if (!this.bodyMapAssociation) {
      this.isEditMode = false;
      this.bodyMapAssociation = {
        muscleIds: [],
        packets: [],
        color: '#ffff00'
      };
    }
    this.httpService.get(this.bodyMap.dataUrl).subscribe(res => {
      const muscleList = res as {id: string; label: string }[];
      this.muscleListOptions = muscleList.map(m => ({value: m.id, label: m.label}));
      this.ready = true;
    });

  }

  onChangeSelectMuscle(event) {
    if (!event.value) {
      return;
    }
    this.bodyMapAssociation.muscleIds = event.value;
  }

  onChangePackets(event) {
    this.bodyMapAssociation.packets = event;
  }

  onChangeColor(event) {
    this.bodyMapAssociation.color = event.target.value;
  }

  isButtonDisabled() {
    return this.bodyMapAssociation.muscleIds.length === 0 || this.bodyMapAssociation.packets.length === 0;
  }

  saveAndExit() {
    this.save.emit(this.bodyMapAssociation);
    this.onSubmit.next(this.bodyMapAssociation);
  }

  cancelAndExit() {
    this.save.emit(null);
    this.onSubmit.next(null);
  }

}
