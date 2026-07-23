import { Test, TestingModule } from '@nestjs/testing';
import { LicencesController } from './licences.controller';

describe('LicencesController', () => {
  let controller: LicencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LicencesController],
    }).compile();

    controller = module.get<LicencesController>(LicencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
