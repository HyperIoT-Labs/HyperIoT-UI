import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketEnrichmentComponent } from './packet-enrichment.component';

describe('PacketEnrichmentComponent', () => {
  let component: PacketEnrichmentComponent;
  let fixture: ComponentFixture<PacketEnrichmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketEnrichmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketEnrichmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
