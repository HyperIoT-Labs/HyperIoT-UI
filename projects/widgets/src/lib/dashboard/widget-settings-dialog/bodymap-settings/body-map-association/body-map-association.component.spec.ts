import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyMapAssociationComponent } from './body-map-association.component';

describe('BodyMapAssociationComponent', () => {
  let component: BodyMapAssociationComponent;
  let fixture: ComponentFixture<BodyMapAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyMapAssociationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyMapAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
