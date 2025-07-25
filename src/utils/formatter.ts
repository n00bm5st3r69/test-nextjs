export const getFieldValue = (
  field: string | string[] | number | undefined
): string | number => {
  if (Array.isArray(field)) return field[0];
  return field ?? "";
};
