export const suffixZ = (iso: string): string => {
  return isoHasTZ(iso) ? "" : "Z";
};

export const isoHasTZ = (str: string): boolean => {
  return /[zZ]|[+\-]\d{2}:?\d{2}$/.test(str);
};
