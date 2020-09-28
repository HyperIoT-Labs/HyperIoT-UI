import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmInfoFormComponent } from './algorithm-info-form.component';

describe('AlgorithmInfoFormComponent', () => {
  let component: AlgorithmInfoFormComponent;
  let fixture: ComponentFixture<AlgorithmInfoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmInfoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
