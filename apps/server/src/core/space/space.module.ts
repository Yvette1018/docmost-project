import { Module } from '@nestjs/common';
import { SpaceService } from './services/space.service';
import { SpaceController } from './space.controller';
import { SpaceMemberService } from './services/space-member.service';
import { GraphService } from './services/graph.service';

@Module({
  imports: [],
  controllers: [SpaceController],
  providers: [SpaceService, SpaceMemberService, GraphService,],
  exports: [SpaceService, SpaceMemberService],
})
export class SpaceModule { }
