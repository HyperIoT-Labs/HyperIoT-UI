import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

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

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
