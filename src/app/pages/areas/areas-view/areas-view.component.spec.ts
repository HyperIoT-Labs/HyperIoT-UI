import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasViewComponent } from './areas-view.component';

describe('AreasViewComponent', () => {
  let component: AreasViewComponent;
  let fixture: ComponentFixture<AreasViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreasViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreasViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
