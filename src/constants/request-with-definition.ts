import {
  SearchJobParams,
  buildSearchJobsQueryString,
} from "../extensions/linkedin.com/apis/search-jobs";
import {
  SearchPeopleParams,
  buildSearchPeopleQueryString,
} from "../extensions/linkedin.com/apis/search-people";

export type QueryStringBuilderFunction<
  T extends Record<string, unknown> = Record<string, unknown>
> = (params: T) => string;

export const QUERY_STRING_BUILDER_MAP: Record<
  string,
  QueryStringBuilderFunction
> = {
  "{{linkedin.com/search-people.buildSearchPeopleQueryString()}}": (params) => {
    return buildSearchPeopleQueryString(
      params as unknown as SearchPeopleParams
    );
  },
  "{{linkedin.com/search-jobs.buildSearchJobsQueryString()}}": (params) => {
    return buildSearchJobsQueryString(params as unknown as SearchJobParams);
  },
};
