export type Status = "pending" | "success" | "error";

export enum Action {
  FetchAPIOnTargetWebsite = "fetch-api-on-target-website",
}

export interface Message<Payload = unknown> {
  id: string | number;
  status: Status;
  action: Action;
  payload: Payload;
  targetTabId?: number;
}

export const isMessage = (payload: unknown): payload is Message => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    "status" in payload &&
    "action" in payload &&
    "payload" in payload &&
    Object.values(Action).includes(payload.action as Action)
  );
};
