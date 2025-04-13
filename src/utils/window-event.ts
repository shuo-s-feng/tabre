export enum CustomEventKey {
  LocalStorageChange = "localstoragechange",
}

export const dispatchCustomEvent = <CustomEventPaylod>(
  key: CustomEventKey,
  detail?: CustomEventPaylod
) => {
  window.dispatchEvent(
    new CustomEvent(key, {
      detail,
    })
  );
};
