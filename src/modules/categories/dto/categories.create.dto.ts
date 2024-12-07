import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CategoryCreateDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @IsOptional()
  @IsString({ message: 'Meta title must be a string' })
  metaTitle?: string | null;

  @IsOptional()
  @IsString({ message: 'Meta description must be a string' })
  metaDescription?: string | null;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image?: string | null;

  @IsOptional()
  @IsString({ message: 'Parent ID must be a string' })
  parentId?: string;
}

// Update DTO using PartialType to make all fields optional
export class CategoryUpdateDto extends PartialType(CategoryCreateDto) {}
