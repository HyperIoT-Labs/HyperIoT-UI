import { TestBed } from "@angular/core/testing";

import { ParameterizedService } from "./parameterized.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ParameterizedService", () => {
  let service: ParameterizedService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ParameterizedService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
