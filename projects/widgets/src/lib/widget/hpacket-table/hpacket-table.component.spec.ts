import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HpacketTableComponent } from './hpacket-table.component';

describe('HpacketTableComponent', () => {
  let component: HpacketTableComponent;
  let fixture: ComponentFixture<HpacketTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HpacketTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HpacketTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
