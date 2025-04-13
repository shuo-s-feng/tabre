import { RequestDefinitionFile } from "./request-definition";

declare module "*.json" {
  const value: RequestDefinitionFile;
  export default value;
}
