import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class EventLogFindPaginatedQueryDto extends PaginatedQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.split(','))
  types: string[];
}