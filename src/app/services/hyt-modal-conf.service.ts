import { Injectable } from '@angular/core';
import { HytModal } from './hyt-modal';

@Injectable({
  providedIn: 'root'
})
export class HytModalConfService {

  private modals: HytModal[] = [];

  constructor() { }

  add(modal: HytModal) {
    // add modal to array of active modals
    this.modals.push(modal);
  }

  remove(id: string) {
    // remove modal from array of active modals
    this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string, data?: any) {
    // open modal specified by id
    const modal: HytModal = this.modals.find(x => x.id === id);
    modal.open(data);
  }

  close(id: string) {
    // close modal specified by id
    const modal: any = this.modals.find(x => x.id === id);
    modal.close();
  }

}
