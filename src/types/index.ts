export interface CollegeListItem {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  type: CollegeType;
  rating: number;
  totalFees: number;
  naacGrade: string | null;
  nirfRank: number | null;
  placementAvg: number | null;
  logoUrl: string | null;
  imageUrl: string | null;
}

export interface CollegeDetail extends CollegeListItem {
  overview: string;
  established: number | null;
  website: string | null;
  placementMax: number | null;
  placementPct: number | null;
  topRecruiters: string[];
  courses: CourseDetail[];
  reviews: ReviewDetail[];
  cutoffs: CutoffDetail[];
}

export interface CourseDetail {
  id: string;
  name: string;
  duration: number;
  fees: number;
  seats: number | null;
}

export interface ReviewDetail {
  id: string;
  author: string;
  rating: number;
  body: string;
  category: string;
  createdAt: string;
}

export interface CutoffDetail {
  id: string;
  exam: ExamType;
  category: Category;
  rankMin: number;
  rankMax: number;
  year: number;
  branch: string | null;
}

export interface CollegePrediction {
  collegeId: string;
  collegeName: string;
  collegeSlug: string;
  collegeLocation: string;
  collegeType: CollegeType;
  branch: string | null;
  rankMin: number;
  rankMax: number;
  confidence: 'Likely' | 'Possible' | 'Stretch';
}

export interface QuestionItem {
  id: string;
  title: string;
  body: string;
  tags: string[];
  answerCount: number;
  viewCount: number;
  author: string;
  createdAt: string;
}

export interface AnswerItem {
  id: string;
  body: string;
  author: string;
  accepted: boolean;
  createdAt: string;
  userId: string;
}

export interface SavedCollegeItem {
  id: string;
  collegeId: string;
  college: CollegeListItem;
  savedAt: string;
}

export interface ComparisonItem {
  id: string;
  collegeIds: string[];
  name: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

export enum CollegeType {
  IIT = 'IIT',
  NIT = 'NIT',
  IIIT = 'IIIT',
  DEEMED = 'DEEMED',
  STATE = 'STATE',
  PRIVATE = 'PRIVATE',
}

export enum ExamType {
  JEE_MAINS = 'JEE_MAINS',
  JEE_ADVANCED = 'JEE_ADVANCED',
  EAMCET_TS = 'EAMCET_TS',
  EAMCET_AP = 'EAMCET_AP',
}

export enum Category {
  GENERAL = 'GENERAL',
  OBC = 'OBC',
  SC = 'SC',
  ST = 'ST',
  EWS = 'EWS',
}