import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, Type, ViewChild, ViewEncapsulation } from '@angular/core';
import { HytModal } from './hyt-modal';
import { HytModalContentDirective } from './hyt-modal-content.directive';
import { HytModalRef } from './hyt-modal-ref';

@Component({
  selector: 'hyt-modal-container',
  templateUrl: './hyt-modal-container.component.html',
  styleUrls: ['./hyt-modal-container.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HytModalContainerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(HytModalContentDirective, { static: true }) hytModalContent: HytModalContentDirective;

  componentRef: ComponentRef<any>;

  childComponent: HytModalRef;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    this.loadChildComponent(this.childComponent.component);
  }

  ngAfterViewInit() { }

  loadChildComponent(componentType: Type<HytModal>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const viewContainerRef = this.hytModalContent.viewContainerRef;
    viewContainerRef.clear();
    this.componentRef = viewContainerRef.createComponent(componentFactory);
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  onOverlayClicked(evt: MouseEvent) {
    if (this.childComponent.conf.isClosableFromBackground) {
      this.childComponent.close();
    }
  }

  onDialogClicked(evt: MouseEvent) {
    evt.stopPropagation();
  }

}
