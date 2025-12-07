import { Category, ICategoryDocument } from '../models/category.model';

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  icon?: string;
  order?: number;
}

export class CategoryService {
  // Create category
  static async create(data: CreateCategoryData): Promise<ICategoryDocument> {
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return Category.create({
      ...data,
      slug,
    });
  }

  // Get all categories
  static async getAll(includeInactive = false): Promise<ICategoryDocument[]> {
    const query = includeInactive ? {} : { isActive: true };
    return Category.find(query).sort({ order: 1, name: 1 });
  }

  // Get category tree (hierarchical structure)
  static async getCategoryTree(): Promise<Array<ICategoryDocument & { children: ICategoryDocument[] }>> {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    const categoryMap = new Map<string, ICategoryDocument & { children: ICategoryDocument[] }>();
    const rootCategories: Array<ICategoryDocument & { children: ICategoryDocument[] }> = [];

    // First pass: create map
    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    });

    // Second pass: build tree
    categories.forEach((cat) => {
      const categoryWithChildren = categoryMap.get(cat._id.toString())!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId.toString());
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  // Get category by ID
  static async getById(id: string): Promise<ICategoryDocument | null> {
    return Category.findById(id);
  }

  // Get category by slug
  static async getBySlug(slug: string): Promise<ICategoryDocument | null> {
    return Category.findOne({ slug, isActive: true });
  }

  // Update category
  static async update(
    id: string, 
    updates: Partial<CreateCategoryData>
  ): Promise<ICategoryDocument | null> {
    if (updates.name) {
      const baseSlug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      let slug = baseSlug;
      let counter = 1;
      while (await Category.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      (updates as Record<string, unknown>).slug = slug;
    }

    return Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
  }

  // Delete category
  static async delete(id: string): Promise<ICategoryDocument | null> {
    // Check if category has children
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      throw new Error('Cannot delete category with subcategories');
    }

    // Check if category has products
    const category = await Category.findById(id);
    if (category && category.productCount > 0) {
      throw new Error('Cannot delete category with products');
    }

    return Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  // Get subcategories
  static async getSubcategories(parentId: string): Promise<ICategoryDocument[]> {
    return Category.find({ parentId, isActive: true }).sort({ order: 1, name: 1 });
  }

  // Reorder categories
  static async reorder(
    orderedIds: string[]
  ): Promise<void> {
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index },
      },
    }));

    await Category.bulkWrite(bulkOps);
  }
}
