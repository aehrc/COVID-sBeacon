import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrepifunComponent } from './strepifun.component';

describe('StrepifunComponent', () => {
  let component: StrepifunComponent;
  let fixture: ComponentFixture<StrepifunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrepifunComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrepifunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
