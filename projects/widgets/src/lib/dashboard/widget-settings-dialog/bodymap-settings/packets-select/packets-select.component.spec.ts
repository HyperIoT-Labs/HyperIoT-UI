import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketsSelectComponent } from './packets-select.component';

describe('PacketsSelectComponent', () => {
  let component: PacketsSelectComponent;
  let fixture: ComponentFixture<PacketsSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PacketsSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
