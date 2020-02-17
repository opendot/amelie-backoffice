import { timeFormat as d3TimeFormat } from "d3";

export const formatDate = date => d3TimeFormat("%d/%m/%Y")(new Date(date));

function padTime(t) {
  return `${t}`.length === 1 ? `0${t}` : t
}

export function formatTime(t) {
  const secs = t % 60
  const mins = (t - secs) / 60
  return `${padTime(mins)}:${padTime(secs)}`
}
