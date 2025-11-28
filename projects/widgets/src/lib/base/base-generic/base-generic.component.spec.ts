import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BaseGenericComponent } from './base-generic.component';

describe('BaseTableComponent', () => {
  let component: BaseGenericComponent;
  let fixture: ComponentFixture<BaseGenericComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseGenericComponent ]
    })
    .compileComponents();
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
