# Tabre API Definition Guide

## Overview

Tabre is a powerful tool for creating and managing API endpoints. This guide will help you understand how to create API JSON files that define the structure and behavior of your API endpoints.

## Directory Structure

API definitions are organized in the following structure:

```
public/
└── domain.com/           # Domain-specific endpoints
    └── single-step/      # Single-step API endpoints
    └── multiple-steps/   # Multi-step API endpoints
```

## JSON File Structure

Each API endpoint is defined in a JSON file with the following structure:

```json
{
  "id": "path/to/file_without_suffix",
  "params": {
    "paramName1": {
      "type": "string|number|boolean",
      "description": "Parameter description",
      "example": "Example value",
      "default": "Default value",
      "required": "true|false",
      "preprocess": {
        "endpoint": "path/to/another_file_without_suffix",
        "params": {
          "anotherParamName1": "{{paramName1}}"
        },
        "return": "path.to.value",
        "newKey": "newParamName1"
      }
    },
    "paramName2": {
      "type": "string|number|boolean",
      "description": "Parameter description",
      "example": "Example value",
      "default": "Default value",
      "required": "true|false",
      "preprocess": {
        "endpoint": "path/to/another_file_without_suffix",
        "params": {
          "anotherParamName2": "{{paramName2}}"
        },
        "return": "path.to.value",
        "newKey": "newParamName2"
      }
    }
  },
  "request": {
    "name": "RequestName",
    "description": "Request description",
    "method": "GET|POST|PUT|DELETE",
    "domain": "https://api.example.com",
    "endpoint": "/api/endpoint",
    "queryParameters": {
      "paramName1": "{{newParamName}}"
    },
    "queryStringBuilder": "path/to/customQueryStringBuilder",
    "headers": {
      "header-name-1": "{{paramName2}}",
      "header-name-2": "Bearer {{cs_jsonParse(localStorage.access)}}"
    },
    "queryTab": {
      "url": "*://*.example.com/*"
    },
    "requestInitiator": "tab",
    "requestMethodType": "fetch"
  },
  "response": {
    "successfulStatusCodes": [200],
    "parsingConfig": {
      "fieldName": "path.to.value"
    },
    "parsingJs": {
      "code": "custom-js-(not-ts)-code"
    }
  }
}
```

## Key Components

### 1. ID

- Unique identifier for the API endpoint
- Format: `{domain}/{step-type}/{endpoint-name}`
  - `step-type` can be either `single-step` or `multiple-steps`, where the difference is that `multiple-steps` includes pararmeter preprocessing
- Example: `linkedin.com/multiple-steps/get-company-details`

### 2. Parameters (params)

Define the input parameters for the API:

```json
"params": {
  "paramName1": {
    "type": "string|number|boolean",
    "description": "Parameter description",
    "example": "Example value",
    "default": "Default value",
    "required": "true|false",
    "preprocess": {
      "endpoint": "path/to/another_file_without_suffix",
      "params": {
        "anotherParamName1": "{{paramName1}}"
      },
      "return": "path.to.value",
      "newKey": "newParamName1"
    }
  },
  "paramName2": {
    "type": "string|number|boolean",
    "description": "Parameter description",
    "example": "Example value",
    "default": "Default value",
    "required": "true|false",
    "preprocess": {
      "endpoint": "path/to/another_file_without_suffix",
      "params": {
        "anotherParamName2": "{{paramName2}}"
      },
      "return": "path.to.value",
      "newKey": "newParamName2"
    }
  }
}
```

Example:

```json
"params": {
  "companyName": {
    "type": "string",
    "description": "The public ID of the company.",
    "example": "Amazon",
    "preprocess": {
      "endpoint": "/linkedin.com/single-step/search-companies",
      "params": {
        "keywords": "{{companyName}}",
        "start": 0,
        "queryId": "voyagerSearchDashClusters.994bf4e7d2173b92ccdb5935710c3c5d"
      },
      "return": "0.companyPublicId",
      "newKey": "companyPublicId"
    }
  },
  "queryId": {
    "type": "string",
    "description": "The query ID for the search companies API.",
    "example": "voyagerOrganizationDashCompanies.14020cba5d6e7118597eb6a8f5727a35",
    "default": "voyagerOrganizationDashCompanies.14020cba5d6e7118597eb6a8f5727a35"
  }
}
```

Then, use `{{variable}}` syntax to substitute values in `request` property.

#### Parameter Preprocessing

The `preprocess` attribute can be a complex object that uses a separate API call to transform the parameter value:

```json
"preprocess": {
  "endpoint": "/linkedin.com/single-step/search-companies",
  "params": {
    "keywords": "{{companyName}}",
    "start": 0,
    "queryId": "voyagerSearchDashClusters.994bf4e7d2173b92ccdb5935710c3c5d"
  },
  "return": "0.companyPublicId",
  "newKey": "companyPublicId"
}
```

This complex preprocessing:

- Use API defined at `/linkedin.com/single-step/search-companies` to search companies
- Passes the parameters defined in the `params` object `companyName` into the above search companies API via its parameter `keywords`
- Extracts the value from the response using the `return` path, i.e., retrieve the first array element's `companyPublicId` property. For more context about how to define `return`, please refer to [geton](https://github.com/shuo-s-feng/geton) as it's the template engine of response extraction
- Renames the parameter to `companyPublicId` specified in `newKey`

### 3. Request Configuration

#### Normal Mode

Define how the request should be made via normal mode:

```json
"request": {
  "name": "RequestName",
  "description": "Request description",
  "method": "GET|POST|PUT|DELETE",
  "domain": "https://api.example.com",
  "endpoint": "/api/endpoint",
  "queryParameters": {
    "paramName1": "{{newParamName}}"
  },
  "headers": {
    "header-name-1": "{{paramName2}}",
    "header-name-2": "Bearer {{cs_jsonParse(localStorage.access)}}"
  },
  "queryTab": {
    "url": "*://*.example.com/*"
  },
  "requestInitiator": "tab",
  "requestMethodType": "fetch"
}
```

Example:

```json
"request": {
  "name": "GetCompanyDetails",
  "description": "Gets company details based on company name.",
  "method": "GET",
  "domain": "https://www.linkedin.com",
  "endpoint": "/voyager/api/graphql",
  "queryParameters": {
    "variables": "(universalName:{{companyPublicId}})",
    "queryId": "{{queryId}}"
  },
  "headers": {
    "csrf-token": "{{cs_jsonParse(cookies.JSESSIONID)}}"
  },
  "queryTab": {
    "url": "*://*.linkedin.com/*"
  },
  "requestInitiator": "tab",
  "requestMethodType": "fetch"
}
```

In this case, the parameters get used only in query parameters.

For demonstration about `{{cs_jsonParse(cookies.JSESSIONID)}}`, please refer to the [Tab-related Context Injection](#tab-related-context-injection) section.

#### Custom Mode

Define how the request should be made via custom mode:

```json
"request": {
  "name": "RequestName",
  "description": "Request description",
  "method": "GET|POST|PUT|DELETE",
  "domain": "https://api.example.com",
  "endpoint": "/api/endpoint",
  "queryStringBuilder": "path/to/customQueryStringBuilder",
  "headers": {
    "header-name-1": "{{paramName2}}",
    "header-name-2": "Bearer {{cs_jsonParse(localStorage.access)}}"
  },
  "queryTab": {
    "url": "*://*.example.com/*"
  },
  "requestInitiator": "tab",
  "requestMethodType": "fetch"
}
```

Example:

Refer to `public/linkedin.com/multiple-steps/search-people.json`:

```json
"request": {
  "name": "SearchPeople",
  "description": "Searches for people based on various filters and criteria.",
  "method": "GET",
  "domain": "https://www.linkedin.com",
  "endpoint": "/voyager/api/graphql",
  "queryStringBuilder": "{{linkedin.com/search-people.buildSearchPeopleQueryString()}}",
  "headers": {
    "csrf-token": "{{cs_jsonParse(cookies.JSESSIONID)}}"
  },
  "queryTab": {
    "url": "*://*.linkedin.com/*"
  },
  "requestInitiator": "tab",
  "requestMethodType": "fetch"
}
```

To build the query string, it will call the method `buildSearchPeopleQueryString()` defined in `src/extensions/linkedin.com/apis/search-people.ts`, with all parameters.

If you want to create your own custom handler, don't forget to register it on `src/constants/request-with-definition.ts`.

#### Tab-related Context Injection

Use placeholder starting with `cs_` to let the content script of the Chrome extension to inject necessary data for this request.
Both local storage and cookies lookup will be provided.

The example access the cookies `JSESSIONID` property and calles `jsonParse()` to parse the string as the value for header `csrf-token`.
Another common use case is to attach JWT access token by `Bearer {{jsonParse(localStorage.access)}}`.

Available methods like `jsonParse()`:

| Handler         | Description                                    |
| --------------- | ---------------------------------------------- |
| `concat`        | Concatenates multiple values with commas       |
| `upper`         | Converts a string to uppercase                 |
| `lower`         | Converts a string to lowercase                 |
| `replace`       | Replaces first occurrence of a substring       |
| `replaceAll`    | Replaces all occurrences of a substring        |
| `jsonParse`     | Parses a JSON string                           |
| `jsonStringify` | Stringifies a JSON object                      |
| `list`          | Extracts a property from each item in an array |

This project uses [geton](https://github.com/shuo-s-feng/geton) for data extraction and transformation.
Feel free to directly play around with the library!

### 4. Response Configuration

#### Parsing via Config

Define how to parse the response via `parsingConfig`:

```json
"response": {
  "successfulStatusCodes": [200],
  "parsingConfig": {
    "fieldName": "path.to.value"
  }
}
```

Example:

```json
"response": {
  "successfulStatusCodes": [200],
  "parsingConfig": {
    "companyId": "body.data.organizationDashCompaniesByUniversalName.elements.0.entityUrn.replace('urn:li:fsd_company:', '')",
    "companyPublicId": "body.data.organizationDashCompaniesByUniversalName.elements.0.universalName",
  }
}
```

Again, each property of `parsingConfig` uses [geton](https://github.com/shuo-s-feng/geton) for data extraction and transformation.
Feel free to directly play around with the library!

#### Parsing via JS

Define how to parse the response via `parsingJs`:

```json
"response": {
  "successfulStatusCodes": [200],
  "parsingJs": {
    "code": "custom-js-(not-ts)-code",
  }
}
```

Example:

```json
"response": {
  "successfulStatusCodes": [
    200
  ],
  "parsingConfig": {
    "code": "return { companyId: response.body.data.organizationDashCompaniesByUniversalName.elements[0].entityUrn.replace('urn:li:fsd_company:', ''), companyPublicId: response.body.data.organizationDashCompaniesByUniversalName.elements[0].universalName }"
  }
}
```

Please note, `response` variable will be injected into the custom code. When data is ready, use `return` to provide the parsing result.

## Testing Your API Definitions

1. Place your JSON file in the text field under `PLAYGROUND` / `DEFINITION`
2. Switch to `PLAYGROUND` / `RUNNER` and start testing
