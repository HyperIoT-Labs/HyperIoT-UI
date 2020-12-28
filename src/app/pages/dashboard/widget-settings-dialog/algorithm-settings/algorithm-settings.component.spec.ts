import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmSettingsComponent } from './algorithm-settings.component';

describe('AlgorithmSettingsComponent', () => {
  let component: AlgorithmSettingsComponent;
  let fixture: ComponentFixture<AlgorithmSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
