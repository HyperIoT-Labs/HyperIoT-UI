import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmSelectComponent } from './algorithm-select.component';

describe('AlgorithmSelectComponent', () => {
  let component: AlgorithmSelectComponent;
  let fixture: ComponentFixture<AlgorithmSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlgorithmSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgorithmSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
