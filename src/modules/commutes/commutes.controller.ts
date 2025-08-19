import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CommutesService } from './commutes.service';
import { SearchCommuteDto, CommuteResultDto } from './dto/search-commute.dto';

@ApiTags('通勤検索')
@Controller('commutes')
export class CommutesController {
  constructor(private readonly commutesService: CommutesService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '通勤候補駅検索',
    description:
      '勤務地駅を入力して、30分以内でアクセス可能な住居候補駅を検索します',
  })
  @ApiBody({ type: SearchCommuteDto })
  @ApiResponse({
    status: 200,
    description: '検索成功',
    type: [CommuteResultDto],
  })
  @ApiResponse({
    status: 404,
    description: '指定された駅が見つかりません',
  })
  async searchCommutes(
    @Body() searchDto: SearchCommuteDto,
  ): Promise<CommuteResultDto[]> {
    return this.commutesService.searchCommuteCandidates(searchDto.origin);
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'サンプルデータ投入',
    description: 'テスト用のサンプル駅・路線データを投入します',
  })
  @ApiResponse({
    status: 200,
    description: 'サンプルデータ投入完了',
  })
  async seedData(): Promise<{ message: string }> {
    await this.commutesService.seedSampleData();
    return { message: 'サンプルデータを投入しました' };
  }
}
