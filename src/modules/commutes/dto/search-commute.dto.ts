import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchCommuteDto {
  @ApiProperty({
    description: '勤務地の駅名（日本語）',
    example: '渋谷',
  })
  @IsString()
  @IsNotEmpty()
  origin: string;
}

export class CommuteResultDto {
  @ApiProperty({ description: '候補駅名', example: '恵比寿' })
  station: string;

  @ApiProperty({ description: '路線名', example: '山手線' })
  line: string;

  @ApiProperty({ description: '通勤時間（分）', example: 4 })
  minutes: number;

  @ApiProperty({
    description: 'SUUMO物件検索URL',
    example: 'https://suumo.jp/chintai/...',
    required: false,
  })
  suumo_url?: string;
}
