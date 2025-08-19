import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommutesController } from './commutes.controller';
import { CommutesService } from './commutes.service';
import { Station, CommuteCandidate } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Station, CommuteCandidate])],
  controllers: [CommutesController],
  providers: [CommutesService],
  exports: [CommutesService],
})
export class CommutesModule {}
