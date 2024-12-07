import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @IsString()
  @ApiProperty({ description: 'Size of the variant' })
  size: string;

  @IsNumber()
  @ApiProperty({ description: 'Total stock quantity' })
  stock: number;

  @IsNumber()
  @ApiProperty({ description: 'Available stock quantity' })
  availableStock: number;
}

export class CreateVariantDto {
  @IsString()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Color of the product variant' })
  color: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Product variant images',
  })
  @Type(() => Object)
  images: Express.Multer.File[];

  @IsString()
  @ApiProperty({ description: 'Size of the variant' })
  size: string;

  @ValidateNested()
  @Type(() => CreateInventoryDto)
  @ApiProperty({ type: CreateInventoryDto, description: 'Inventory details' })
  inventory: CreateInventoryDto[];
}
