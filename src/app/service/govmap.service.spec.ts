import { TestBed } from '@angular/core/testing';

import { GovmapService } from './govmap.service';

describe('GovmapService', () => {
  let service: GovmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GovmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
