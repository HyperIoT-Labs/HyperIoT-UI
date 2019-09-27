import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketEnrichmentsDataComponent } from './packet-enrichments-data.component';

describe('PacketEnrichmentsDataComponent', () => {
  let component: PacketEnrichmentsDataComponent;
  let fixture: ComponentFixture<PacketEnrichmentsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketEnrichmentsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketEnrichmentsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
