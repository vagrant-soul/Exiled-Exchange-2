import { ModifierType, StatCalculated } from "@/parser/modifiers";
import type { ParsedItem } from "@/parser";
import type { StatFilter } from "../interfaces";

const EMOTIONS = [
  "Distilled Ire",
  "Distilled Guilt",
  "Distilled Greed",
  "Distilled Paranoia",
  "Distilled Envy",
  "Distilled Disgust",
  "Distilled Despair",
  "Distilled Fear",
  "Distilled Suffering",
  "Distilled Isolation",
];

export function decodeOils(calc: StatCalculated): string[] | undefined {
  if (calc.type !== ModifierType.Enchant) return;

  // try Amulet enchant
  let encoded = calc.sources[0].stat.translation.oils;
  // else try Ring enchant
  if (!encoded && calc.stat.anointments) {
    if (calc.stat.anointments.length === 1) {
      encoded = calc.stat.anointments[0].oils;
    } else {
      encoded = calc.stat.anointments.find(
        (anoint) => anoint.roll === calc.sources[0].stat.roll?.value,
      )?.oils;
    }
  }
  if (!encoded) return;

  const decoded = encoded
    .split(",")
    .map(Number)
    // .sort((a, b) => b - a) // [Golden Oil ... Clear Oil]
    .map((idx) => EMOTIONS[idx]);

  return decoded;
}

export function applyAnointmentRules(filters: StatFilter[], item: ParsedItem) {
  const anointment = filters.find((filter) => filter.oils);
  if (!anointment) return;

  if (item.talismanTier) {
    anointment.disabled = false;
  } else if (!item.isCorrupted && !item.isMirrored) {
    const oils = anointment.oils!;
    if (
      !oils.includes("Distilled Isolation") &&
      !oils.includes("Distilled Suffering")
    ) {
      anointment.hidden = "filters.hide_anointment";
      anointment.disabled = true;
    }
  }
}
