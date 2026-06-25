import { IsString, IsNotEmpty } from 'class-validator';

export class GetSpaceGraphDto {
    @IsString()
    @IsNotEmpty()
    spaceId: string;
}