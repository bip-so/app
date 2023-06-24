import { MONTHS } from "./Constants";

export function dateMonthYearDate(date: string) {
  return `${new Date(date).getDate()} ${
    MONTHS[new Date(date).getMonth()]
  } ${new Date(date).getFullYear()}`;
}

export function getTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
