import { pruneEmptyValues } from "../utils/builder";
import { encodeQueryParamsV2 } from "../utils/encoders";
import {
  SortBy,
  ExpLevel,
  JobType,
  Salary,
  Commitment,
  WorkplaceType,
} from "../utils/types";
import { getRelativeTimestamp } from "../utils/timestamp";
import { QueryStringBuilderFunction } from "../../../constants/request-with-definition";

export interface SearchJobParams {
  keywords: string;
  locationId?: string | number;
  companyId?: string | number;
  timePostedRange?: string;
  jobType?: JobType;
  sortBy?: SortBy;
  applyWithLinkedIn?: boolean;
  commitment?: Commitment;
  distance?: number;
  expLevel?: ExpLevel;
  earlyApplicant?: boolean;
  functionId?: string;
  industryId?: string;
  inYourNetwork?: boolean;
  populatedPlaceGeoId?: string | number;
  salaryBucketV2?: Salary;
  titleId?: string;
  workplaceType?: WorkplaceType;
  start?: number;
  count?: number;
  decorationId?: string;

  // The QueryStringBuilderFunction type requires its generic parameter to extend Record<string, unknown>
  [key: string]: unknown;
}

export const buildSearchJobsQueryString: QueryStringBuilderFunction<
  SearchJobParams
> = ({
  keywords,
  locationId,
  sortBy = SortBy.MostRelevant,
  applyWithLinkedIn = false,
  companyId,
  commitment,
  distance,
  expLevel,
  earlyApplicant = false,
  functionId,
  industryId,
  jobType,
  inYourNetwork = false,
  populatedPlaceGeoId,
  salaryBucketV2,
  titleId,
  timePostedRange,
  workplaceType,
  start = 0,
  count = 25,
  decorationId = "com.linkedin.voyager.dash.deco.jobs.search.JobSearchCardsCollection-213",
}): string => {
  const queryParams: Record<string, unknown> = {
    decorationId,
    q: "jobSearch",
    query: {
      origin: "JOB_SEARCH_PAGE_JOB_FILTER",
      keywords,
      locationUnion: { geoId: locationId },
      selectedFilters: {
        company: companyId ? [companyId] : null,
        sortBy: sortBy ? [sortBy] : null,
        applyWithLinkedIn: applyWithLinkedIn ? [applyWithLinkedIn] : null,
        commitment: commitment ? [commitment] : null,
        experience: expLevel ? [expLevel] : null,
        earlyApplicant: earlyApplicant ? [earlyApplicant] : null,
        distance:
          distance !== undefined ? [Math.round((distance * 5) / 8)] : null,
        function: functionId ? [functionId] : null,
        industry: industryId ? [industryId] : null,
        jobType: jobType ? [jobType] : null,
        inYourNetwork: inYourNetwork ? [inYourNetwork] : null,
        populatedPlace: populatedPlaceGeoId ? [populatedPlaceGeoId] : null,
        salaryBucketV2: salaryBucketV2 ? [salaryBucketV2] : null,
        title: titleId ? [titleId] : null,
        timePostedRange: timePostedRange
          ? [`r${Math.floor(getRelativeTimestamp(timePostedRange))}`]
          : null,
        workplaceType: workplaceType ? [workplaceType] : null,
      },
      spellCorrectionEnabled: true,
    },
    count,
    start,
  };

  const prunedParams = pruneEmptyValues(queryParams);
  return encodeQueryParamsV2(prunedParams);
};

export const buildSearchJobsUrl = (searchParams: SearchJobParams): string => {
  const queryString = buildSearchJobsQueryString(searchParams);
  const path = "https://www.linkedin.com/voyager/api/voyagerJobsDashJobCards";
  return queryString ? `${path}?${queryString}` : path;
};
