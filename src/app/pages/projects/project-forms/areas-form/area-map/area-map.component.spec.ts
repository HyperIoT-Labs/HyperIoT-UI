import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaMapComponent } from './area-map.component';

describe('AreaMapComponent', () => {
  let component: AreaMapComponent;
  let fixture: ComponentFixture<AreaMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
