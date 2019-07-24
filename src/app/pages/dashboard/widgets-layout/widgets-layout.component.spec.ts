import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetsLayoutComponent } from './widgets-layout.component';

describe('WidgetsLayoutComponent', () => {
  let component: WidgetsLayoutComponent;
  let fixture: ComponentFixture<WidgetsLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetsLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
