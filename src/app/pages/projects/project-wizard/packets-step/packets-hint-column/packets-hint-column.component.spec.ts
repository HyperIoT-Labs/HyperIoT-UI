import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketsHintColumnComponent } from './packets-hint-column.component';

describe('PacketsHintColumnComponent', () => {
  let component: PacketsHintColumnComponent;
  let fixture: ComponentFixture<PacketsHintColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketsHintColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketsHintColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
