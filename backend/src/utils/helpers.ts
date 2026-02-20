import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function ensureUniqueSlug(slug: string, model: Model<any>, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;
  const maxRetries = 100;

  while (counter <= maxRetries) {
    const query: any = { slug: uniqueSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await model.findOne(query);
    if (!existing) {
      return uniqueSlug;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  throw new Error(`Could not generate a unique slug for "${slug}" after ${maxRetries} attempts`);
}

export function generateId(): string {
  return uuidv4();
}
