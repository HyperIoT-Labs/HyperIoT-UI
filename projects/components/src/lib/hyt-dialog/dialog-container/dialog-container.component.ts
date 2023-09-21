import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'hyt-dialog-container',
  templateUrl: './dialog-container.component.html',
  styleUrls: ['./dialog-container.component.scss'],
  host: {
    'class': 'hyt-dialog-container',
  }
})
export class DialogContainerComponent { // extends BasePortalOutlet - doesn't extend because TemplatePortal is not supported (attachTemplatePortal)
  @ViewChild(CdkPortalOutlet, {static: true}) _portalOutlet: CdkPortalOutlet;

  constructor() {
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>){

    const result = this._portalOutlet.attachComponentPortal(portal);
    return result;
  }

}
