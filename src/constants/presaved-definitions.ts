export const TYPEAHEAD_DEFINITIONS = [
  {
    label: "Typeahead General",
    path: "/linkedin.com/single-step/typeahead-general.json",
  },
  {
    label: "Typeahead Locations",
    path: "/linkedin.com/single-step/typeahead-locations.json",
  },
  {
    label: "Typeahead Companies",
    path: "/linkedin.com/single-step/typeahead-companies.json",
  },
  {
    label: "Typeahead Schools",
    path: "/linkedin.com/single-step/typeahead-schools.json",
  },
  {
    label: "Typeahead Industries",
    path: "/linkedin.com/single-step/typeahead-industries.json",
  },
  {
    label: "Typeahead People",
    path: "/linkedin.com/single-step/typeahead-people.json",
  },
  {
    label: "Typeahead Service Categories",
    path: "/linkedin.com/single-step/typeahead-service-categories.json",
  },
  {
    label: "Typeahead Functions",
    path: "/linkedin.com/single-step/typeahead-functions.json",
  },
  {
    label: "Typeahead Titles",
    path: "/linkedin.com/single-step/typeahead-titles.json",
  },
];

export const SEARCH_DEFINITIONS = [
  {
    label: "Search Companies",
    path: "/linkedin.com/single-step/search-companies.json",
  },
  {
    label: "Search Schools",
    path: "/linkedin.com/single-step/search-schools.json",
  },
];

export const GET_DETAILS_DEFINITIONS = [
  {
    label: "Get Company Details",
    path: "/linkedin.com/single-step/get-company-details.json",
  },
  {
    label: "Get User Profile",
    path: "/linkedin.com/single-step/get-user-profile.json",
  },
  {
    label: "Get User Profile (Legacy)",
    path: "/linkedin.com/single-step/get-user-profile-legacy.json",
  },
];

export const MULTIPLE_STEP_DEFINITIONS = [
  {
    label: "Search Jobs",
    path: "/linkedin.com/multiple-steps/search-jobs.json",
  },
  {
    label: "Get Company Details",
    path: "/linkedin.com/multiple-steps/get-company-details.json",
  },
  {
    label: "Search People",
    path: "/linkedin.com/multiple-steps/search-people.json",
  },
];

export const DEFINITIONS = [
  ...TYPEAHEAD_DEFINITIONS,
  ...SEARCH_DEFINITIONS,
  ...GET_DETAILS_DEFINITIONS,
  ...MULTIPLE_STEP_DEFINITIONS,
].sort((a, b) => a.path.localeCompare(b.path));

export const AUTOCOMPLETE_DEFINITIONS = DEFINITIONS.map((def) => ({
  label: def.label,
  value: def.path,
}));
