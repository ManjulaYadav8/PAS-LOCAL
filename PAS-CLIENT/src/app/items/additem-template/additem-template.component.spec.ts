import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditemTemplateComponent } from './additem-template.component';

describe('AdditemTemplateComponent', () => {
  let component: AdditemTemplateComponent;
  let fixture: ComponentFixture<AdditemTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditemTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditemTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
