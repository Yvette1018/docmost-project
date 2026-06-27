import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class PageGraphDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pageId?: string;

  @IsOptional()
  @IsUUID()
  spaceId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  depth?: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(200)
  maxNodes?: number;
}
