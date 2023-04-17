import { Injectable } from '@angular/core';
import { StormService } from 'core';

@Injectable({
  providedIn: 'root'
})
export class HytTopologyService {

  constructor(private stormService: StormService) { }

  postRecordingStateOn(projectId: number) {
    return this.stormService.submitProjectTopology(projectId);
  }

  postRecordingStateOff(projectId: number) {
    return this.stormService.killTopology(projectId);
  }

  getRecordingStatus(projectId: number) {
    return this.stormService.getTopology(projectId);
  }

}
