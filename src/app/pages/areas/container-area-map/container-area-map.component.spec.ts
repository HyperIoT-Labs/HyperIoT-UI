import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerAreaMapComponent } from './container-area-map.component';

describe('ContainerAreaMapComponent', () => {
  let component: ContainerAreaMapComponent;
  let fixture: ComponentFixture<ContainerAreaMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerAreaMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerAreaMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
