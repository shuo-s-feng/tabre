import { QueryStringBuilderFunction } from "../../../constants/request-with-definition";
import { pruneEmptyValues } from "../utils/builder";
import { encodeQueryParamsV2 } from "../utils/encoders";
import { Network, ProfileLanguage } from "../utils/types";

export interface SearchPeopleParams {
  keywords: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  school?: string;
  locationId?: string | number;
  currentCompanyId?: string | number;
  pastCompanyId?: string | number;
  industryId?: string | number;
  network?: Network;
  connectionOf?: string | number;
  followerOf?: string | number;
  openToVolunteer?: boolean;
  profileLanguage?: ProfileLanguage;
  schoolId?: string | number;
  serviceCategoryId?: string | number;
  start?: number;

  // The QueryStringBuilderFunction type requires its generic parameter to extend Record<string, unknown>
  [key: string]: unknown;
}

export const buildSearchPeopleQueryString: QueryStringBuilderFunction<
  SearchPeopleParams
> = ({
  keywords,
  firstName,
  lastName,
  title,
  company,
  school,
  locationId,
  currentCompanyId,
  pastCompanyId,
  industryId,
  network,
  connectionOf,
  followerOf,
  openToVolunteer,
  profileLanguage,
  schoolId,
  serviceCategoryId,
  start,
}): string => {
  const queryParams: Record<string, unknown> = {
    variables: {
      start,
      origin: "FACETED_SEARCH",
      query: {
        keywords,
        flagshipSearchIntent: "SEARCH_SRP",
        queryParameters: [
          { key: "resultType", value: ["PEOPLE"] },
          locationId && { key: "geoUrn", value: [locationId] },

          connectionOf && { key: "connectionOf", value: [connectionOf] },
          followerOf && { key: "followerOf", value: [followerOf] },
          network && { key: "network", value: [network] },

          currentCompanyId && {
            key: "currentCompany",
            value: [currentCompanyId],
          },
          pastCompanyId && { key: "pastCompany", value: [pastCompanyId] },
          schoolId && { key: "schoolFilter", value: [schoolId] },
          industryId && { key: "industry", value: [industryId] },

          openToVolunteer && {
            key: "openToVolunteer",
            value: [openToVolunteer],
          },
          profileLanguage && {
            key: "profileLanguage",
            value: [profileLanguage],
          },
          serviceCategoryId && {
            key: "serviceCategory",
            value: [serviceCategoryId],
          },

          // Free text fields
          firstName && { key: "firstName", value: [firstName] },
          lastName && { key: "lastName", value: [lastName] },
          title && { key: "title", value: [title] },
          company && { key: "company", value: [company] },
          school && { key: "schoolFreetext", value: [school] },
        ].filter((param) => param && param?.value && param.value.length > 0),
        includeFiltersInResponse: false,
      },
    },
    queryId: "voyagerSearchDashClusters.9c3177ca40ed191b452e1074f52445a8",
  };

  const prunedParams = pruneEmptyValues(queryParams);
  return encodeQueryParamsV2(prunedParams);
};

export const buildSearchPeopleUrl = (
  searchParams: SearchPeopleParams
): string => {
  const queryString = buildSearchPeopleQueryString(searchParams);
  const path = "https://www.linkedin.com/voyager/api/graphql";
  return queryString ? `${path}?${queryString}` : path;
};
