import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlgorithmSelectComponent } from './algorithm-select.component';

describe('AlgorithmSelectComponent', () => {
  let component: AlgorithmSelectComponent;
  let fixture: ComponentFixture<AlgorithmSelectComponent>;

  beforeEach(waitForAsync(() => {
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
