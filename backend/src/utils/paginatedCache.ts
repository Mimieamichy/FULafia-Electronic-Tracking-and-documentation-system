import { Model } from 'mongoose';
import { getCache, setCache } from './cache';


export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function paginateWithCache<T extends object>(
  model: Model<T>,
  page = 1,
  limit = 10,
  cachePrefix = '',
  ttl = 120,
  filter: Record<string, any> = {}
): Promise<PaginatedResult<T>> {
  const cacheKey = `${cachePrefix}:page=${page}:limit=${limit}:filter=${JSON.stringify(filter)}`;

  // 1. Check cache
  const cached = await getCache<PaginatedResult<T>>(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Fetch from DB
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.find(filter).skip(skip).limit(limit).lean().exec().then(res => res as T[]),
    model.countDocuments(filter),
  ]);

  const result: PaginatedResult<T> = { data, total, page, limit };

  // 3. Save to cache
  await setCache(cacheKey, result, ttl);

  return result;
}
