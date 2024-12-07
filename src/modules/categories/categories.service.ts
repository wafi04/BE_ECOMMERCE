import {
  Logger,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Categories } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryCreateDto } from './dto/categories.create.dto';
export interface CategoryWithChildren extends Categories {
  children?: CategoryWithChildren[];
  parent?: CategoryWithChildren | null;
}

@Injectable()
export class CategoryService {
  private readonly logger = new Logger();

  constructor(private prisma: PrismaService) {}

  async create(data: CategoryCreateDto): Promise<Categories> {
    const { name, description, image, metaDescription, metaTitle, parentId } =
      data;

    // Jika ada parentId, cek kedalaman kategori
    if (parentId) {
      const parentCategory = await this.prisma.categories.findUnique({
        where: { id: parentId },
        include: { children: true },
      });

      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }

      // Cek batasan kedalaman
      const newDepth = (parentCategory.depth || 0) + 1;

      this.logger.log(`Creating category with depth: ${newDepth}`);

      return await this.prisma.categories.create({
        data: {
          name,
          description,
          image,
          metaDescription,
          metaTitle,
          depth: newDepth,
          parentId, // This is what links to the parent
        },
        include: {
          parent: true,
          children: true, // This will fetch children if they exist
        },
      });
    }

    // Untuk kategori top-level, depth adalah 0
    return await this.prisma.categories.create({
      data: {
        name,
        description,
        image,
        metaDescription,
        metaTitle,
        depth: 0,
      },
    });
  }

  async getByDepth(depth: number) {
    return await this.prisma.categories.findMany({
      where: { depth },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async getCategoryTree() {
    // Ambil semua kategori, urutkan berdasarkan depth
    const categories = await this.prisma.categories.findMany({
      orderBy: { depth: 'asc' },
    });

    // Fungsi untuk membuat struktur pohon
    const buildCategoryTree = (categories: Categories[]) => {
      const categoryMap = new Map<string, any>();
      const rootCategories: any[] = [];

      categories.forEach((category) => {
        categoryMap.set(category.id, {
          ...category,
          children: [],
        });
      });

      categories.forEach((category) => {
        if (category.parentId) {
          const parentCategory = categoryMap.get(category.parentId);
          if (parentCategory) {
            parentCategory.children.push(categoryMap.get(category.id));
          }
        } else {
          rootCategories.push(categoryMap.get(category.id));
        }
      });

      return rootCategories;
    };

    return buildCategoryTree(categories);
  }

  async getDescendants(categoryId: string) {
    // Dapatkan semua keturunan dari suatu kategori
    const category = await this.prisma.categories.findUnique({
      where: { id: categoryId },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    });

    return category;
  }

  async update(id: string, data: CategoryCreateDto): Promise<Categories> {
    const { name, description, image, metaDescription, metaTitle } = data;

    // Validate the category exists

    const existingCategory = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    return await this.prisma.categories.update({
      where: { id },
      data: {
        name,
        description,
        image,
        metaDescription,
        metaTitle,
      },
    });
  }

  async delete(id: string): Promise<CategoryWithChildren | null> {
    // Explicitly type the category with the extended interface
    const category = (await this.prisma.categories.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
      },
    })) as CategoryWithChildren | null;

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // If category has children, recursively delete them
    if (category.children && category.children.length > 0) {
      // Recursive function to delete all descendants
      const deleteDescendants = async (categoryId: string) => {
        // Find all children of this category
        const childCategories = await this.prisma.categories.findMany({
          where: { parentId: categoryId },
        });

        // Recursively delete children first
        for (const childCategory of childCategories) {
          // Ensure childCategory has an id
          await deleteDescendants(childCategory.id);
        }

        // Then delete the current category
        await this.prisma.categories.delete({
          where: { id: categoryId },
        });
      };

      // Start recursive deletion from the current category
      await deleteDescendants(id);

      return category;
    }

    // If no children, simply delete the category
    return (await this.prisma.categories.delete({
      where: { id },
    })) as CategoryWithChildren;
  }
  // Helper method to check for circular references
  // private async wouldCreateCircularReference(
  //   categoryId: string,
  //   newParentId: string,
  // ): Promise<boolean> {
  //   // Recursive check to prevent circular references
  //   const checkCircularReference = async (
  //     currentId: string,
  //     targetParentId: string,
  //   ): Promise<boolean> => {
  //     if (currentId === targetParentId) return true;

  //     const category = await this.prisma.categories.findUnique({
  //       where: { id: currentId },
  //     });

  //     if (!category || !category.parentId) return false;

  //     return checkCircularReference(category.parentId, targetParentId);
  //   };

  //   return checkCircularReference(newParentId, categoryId);
  // }
}
