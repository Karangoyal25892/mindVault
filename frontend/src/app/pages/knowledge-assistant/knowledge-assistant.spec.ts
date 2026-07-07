import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeAssistant } from './knowledge-assistant';

describe('KnowledgeAssistant', () => {
  let component: KnowledgeAssistant;
  let fixture: ComponentFixture<KnowledgeAssistant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeAssistant],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeAssistant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
