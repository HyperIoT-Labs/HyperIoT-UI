import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketEnrichmentFormComponent } from './packet-enrichment-form.component';

describe('PacketEnrichmentFormComponent', () => {
  let component: PacketEnrichmentFormComponent;
  let fixture: ComponentFixture<PacketEnrichmentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketEnrichmentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketEnrichmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
