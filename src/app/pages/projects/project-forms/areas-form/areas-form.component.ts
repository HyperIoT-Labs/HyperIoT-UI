import { Component, OnInit, ViewChild, ElementRef, Injector } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Router } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { ProjectFormEntity } from '../project-form-entity';

@Component({
  selector: 'hyt-areas-form',
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.scss']
})
export class AreasFormComponent extends ProjectFormEntity implements OnInit {
  projectId: number;

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private i18n: I18n,
    private router: Router,
    private modalService: HytModalService
  ) {
    super(injector, i18n, formView);
    this.formTitle = 'Project Areas';
    this.showSave = false;
    this.hideDelete = true;
    this.projectId = +this.router.url.split('/')[2];
  }

  ngOnInit() {
  }

}
