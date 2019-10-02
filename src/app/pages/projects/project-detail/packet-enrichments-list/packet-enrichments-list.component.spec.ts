import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketEnrichmentsListComponent } from './packet-enrichments-list.component';

describe('PacketEnrichmentsListComponent', () => {
  let component: PacketEnrichmentsListComponent;
  let fixture: ComponentFixture<PacketEnrichmentsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketEnrichmentsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketEnrichmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
