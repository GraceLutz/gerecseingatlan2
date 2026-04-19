import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (deduplicates and resolves conflicting Tailwind utility classes).
 *
 * @param inputs - Class values: strings, arrays, objects, or falsy values.
 * @returns A single merged class string with Tailwind conflicts resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
