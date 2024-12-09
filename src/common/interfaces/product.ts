import { CategoryCreateDto } from 'src/modules/categories/dto/categories.create.dto';

export interface Product {
  name: string;
  category: {
    name: string;
  };
}
