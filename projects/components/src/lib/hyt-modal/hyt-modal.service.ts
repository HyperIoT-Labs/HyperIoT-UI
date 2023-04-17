import {
  Injectable,
  Component,
  ComponentRef,
  Type,
  ComponentFactoryResolver,
  ApplicationRef,
  EmbeddedViewRef,
  Injector
} from '@angular/core';
import { HytModalRef } from './hyt-modal-ref';
import { HytModalContainerComponent } from './hyt-modal-container.component';
import { HytModalConf } from './hyt-modal-conf';

@Injectable({
  providedIn: 'root'
})
export class HytModalService {

  modalComponentRef: ComponentRef<HytModalContainerComponent>;

  public modalRef: HytModalRef;

  public modalHytConf: HytModalConf = {
    isClosableFromBackground: true,
    data: {}
  };

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  public open(componentType: Type<any>, data?: any, isClosableFromBackground?: boolean): HytModalRef {
    this.modalComponentRef = this._appendModalComponentToBody();
    if (isClosableFromBackground === undefined) {
      this.modalHytConf.isClosableFromBackground = true;
    } else {
      this.modalHytConf.isClosableFromBackground = isClosableFromBackground;
    }
    this.modalHytConf.data = (data) ? data : {};
    this.modalRef = new HytModalRef(componentType, this, this.modalHytConf);
    this.modalComponentRef.instance.childComponent = this.modalRef;
    this.modalComponentRef.changeDetectorRef.detectChanges();

    return this.modalRef;
  }

  public close() {
    this._removeModalComponentFromBody();
  }

  private _appendModalComponentToBody() {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(HytModalContainerComponent)
      .create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
    document.body.classList.add('hyt-modal-open');
    return componentRef;
  }

  private _removeModalComponentFromBody() {
    this.appRef.detachView(this.modalComponentRef.hostView);
    this.modalComponentRef.destroy();
    document.body.classList.remove('hyt-modal-open');
  }

}
