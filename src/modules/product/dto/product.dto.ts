import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ProductCreateDto {
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
export class ProductUpdateDto extends PartialType(ProductCreateDto) {}
