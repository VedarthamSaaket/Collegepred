import { prisma } from './prisma';
import { sanitizeSearchQuery } from './validators';

interface FTSOptions {
  query: string;
  types?: string[];
  state?: string;
  feeMin?: number;
  feeMax?: number;
  naac?: string[];
  nirfMin?: number;
  nirfMax?: number;
  page: number;
  limit: number;
}

interface FTSResult {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  totalFees: number;
  naacGrade: string | null;
  nirfRank: number | null;
  placementAvg: number | null;
  logoUrl: string | null;
  imageUrl: string | null;
}

export async function searchColleges(options: FTSOptions): Promise<{ data: FTSResult[]; total: number }> {
  const { query, types, state, feeMin, feeMax, naac, nirfMin, nirfMax, page, limit } = options;
  const skip = (page - 1) * limit;

  const whereConditions: string[] = [];
  const filterParams: unknown[] = [];
  let paramIndex = 1;

  if (query.trim()) {
    const sanitized = sanitizeSearchQuery(query);
    if (sanitized.length > 0) {
      const tsquery = sanitized
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => `${word}:*`)
        .join(' & ');
      whereConditions.push(`c.search_vector @@ to_tsquery('english', $${paramIndex})`);
      filterParams.push(tsquery);
      paramIndex++;
    }
  }

  if (types && types.length > 0) {
    const typePlaceholders = types.map((_, i) => `$${paramIndex + i}`);
    whereConditions.push(`c."type"::text IN (${typePlaceholders.join(',')})`);
    filterParams.push(...types);
    paramIndex += types.length;
  }

  if (state) {
    whereConditions.push(`c."state" = $${paramIndex}`);
    filterParams.push(state);
    paramIndex++;
  }

  if (feeMin !== undefined) {
    whereConditions.push(`c."totalFees" >= $${paramIndex}`);
    filterParams.push(feeMin);
    paramIndex++;
  }

  if (feeMax !== undefined) {
    whereConditions.push(`c."totalFees" <= $${paramIndex}`);
    filterParams.push(feeMax);
    paramIndex++;
  }

  if (naac && naac.length > 0) {
    const naacPlaceholders = naac.map((_, i) => `$${paramIndex + i}`);
    whereConditions.push(`c."naacGrade" IN (${naacPlaceholders.join(',')})`);
    filterParams.push(...naac);
    paramIndex += naac.length;
  }

  if (nirfMin !== undefined) {
    whereConditions.push(`c."nirfRank" >= $${paramIndex}`);
    filterParams.push(nirfMin);
    paramIndex++;
  }

  if (nirfMax !== undefined) {
    whereConditions.push(`c."nirfRank" <= $${paramIndex}`);
    filterParams.push(nirfMax);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) as total FROM "College" c ${whereClause}`;
  const dataQuery = `
    SELECT
      c."id",
      c."name",
      c."slug",
      c."location",
      c."city",
      c."state",
      c."type",
      c."rating",
      c."totalFees",
      c."naacGrade",
      c."nirfRank",
      c."placementAvg",
      c."logoUrl",
      c."imageUrl"
    FROM "College" c
    ${whereClause}
    ORDER BY
      ${query.trim() ? `ts_rank(c.search_vector, to_tsquery('english', $1)) DESC,` : ''}
      c."rating" DESC,
      c."name" ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataParams = [...filterParams, limit, skip];

  const [countResult, dataResult] = await Promise.all([
    prisma.$queryRawUnsafe<{ total: bigint }[]>(countQuery, ...filterParams),
    prisma.$queryRawUnsafe<FTSResult[]>(dataQuery, ...dataParams),
  ]);

  const total = Number(countResult[0]?.total ?? 0);

  return { data: dataResult, total };
}