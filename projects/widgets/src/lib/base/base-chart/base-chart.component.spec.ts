import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BaseChartComponent } from './base-chart.component';
import {
  AreasFormComponent
} from "../../../../../../src/app/pages/projects/project-forms/areas-form/areas-form.component";

describe('BaseChartComponent', () => {
  let component: AreasFormComponent;
  let fixture: ComponentFixture<AreasFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
