export const getRelativeTimestamp = (
  relativeTimeString: string,
  baseTime: Date = new Date(0),
  useNowAsBaseTime: boolean = false
): number => {
  if (!baseTime || useNowAsBaseTime) {
    baseTime = new Date();
  }

  const sign = relativeTimeString.startsWith("-") ? -1 : 1;

  const regex = /(\d+)y|(\d+)mo|(\d+)w|(\d+)d|(\d+)h|(\d+)min/g;
  let matches;
  let years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0;

  while ((matches = regex.exec(relativeTimeString)) !== null) {
    if (matches[1]) years = parseInt(matches[1]);
    if (matches[2]) months = parseInt(matches[2]);
    if (matches[3]) weeks = parseInt(matches[3]);
    if (matches[4]) days = parseInt(matches[4]);
    if (matches[5]) hours = parseInt(matches[5]);
    if (matches[6]) minutes = parseInt(matches[6]);
  }

  const totalDuration =
    sign *
    (years * 365 * 24 * 60 * 60 +
      months * 30 * 24 * 60 * 60 +
      weeks * 7 * 24 * 60 * 60 +
      days * 24 * 60 * 60 +
      hours * 60 * 60 +
      minutes * 60);

  const resultTime = baseTime.getTime() + totalDuration;
  return resultTime;
};
