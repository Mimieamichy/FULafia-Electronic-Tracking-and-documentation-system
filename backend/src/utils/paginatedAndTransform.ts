import { Model } from 'mongoose';


/**
 * Helper to format a populated supervisor object into a "Title First Last" string.
 * @param sup - The populated supervisor object from a Mongoose query.
 * @returns A formatted name string or null.
 */
function formatSupervisorField(sup: any): string | null {
  if (!sup || !sup.user) {
    return null;
  }

  const user = sup.user;
  const title = user.title ? `${user.title} ` : '';
  const first = user.firstName ?? '';
  const last = user.lastName ?? '';
  const fullName = `${title}${first} ${last}`.trim();

  return fullName || null;
}

// Define the population paths for reuse
const studentPopulationPaths = [
  {
    path: 'majorSupervisor',
    populate: { path: 'user', select: 'firstName lastName title' }
  },
  {
    path: 'minorSupervisor',
    populate: { path: 'user', select: 'firstName lastName title' }
  },
  {
    path: 'internalExaminer',
    populate: { path: 'user', select: 'firstName lastName title' }
  },
  {
    path: 'collegeRep',
    populate: { path: 'user', select: 'firstName lastName title' }
  },
  { path: 'user', select: 'firstName lastName email title' },
];




export interface PaginatedResult<T> {

  data: T[];

  total: number;

  page: number;

  limit: number;

}




/**

* paginateWithCache

*

* - model: Mongoose model

* - page/limit: pagination

* - cachePrefix: string prefix for cache key

* - ttl: cache TTL (seconds)

* - filter: mongoose filter object

* - populate: string | object | array (passed to query.populate)

*/

export async function paginateWithCache<T extends object>(model: Model<T>, page = 1, limit = 10, filter: Record<string, any> = {}, populate: string | object | any[] = []): Promise<PaginatedResult<T>> {
  
  const skip = (page - 1) * limit;
  const query = model.find(filter).populate(studentPopulationPaths).skip(skip).limit(limit);
  
  if (populate && (Array.isArray(populate) ? populate.length > 0 : !!populate)) {
    query.populate(populate as any);
  }
  
  const [data, total] = await Promise.all([

    query.lean().exec().then((res) => res as unknown as T[]),
    model.countDocuments(filter),
  ]);
  
  const result: PaginatedResult<T> = { data, total, page, limit };



  // Post-process Student documents to convert populated supervisors to strings

  if ((model as any).modelName === 'Student') {
    const transformed = (data as any[]).map((s) => {
      return {
        ...s,
        majorSupervisor: formatSupervisorField(s.majorSupervisor),
        minorSupervisor: formatSupervisorField(s.minorSupervisor),
        internalExaminer: formatSupervisorField(s.internalExaminer),
        collegeRep: formatSupervisorField(s.collegeRep),
      };
    });

    result.data = transformed as unknown as T[];

  }

  return result;

}