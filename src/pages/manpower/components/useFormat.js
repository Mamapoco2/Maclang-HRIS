// services/formatters.js
export const buildFullName = (d = {}) => {
  if (!d) return "";

  // ✅ LEGACY / STRING NAME SUPPORT
  if (typeof d.name === "string" && d.name.trim()) {
    return d.name;
  }

  const {
    prefix,
    firstName,
    middleName,
    middleInitial,
    lastName,
    suffix,
    postTitle,
  } = d;

  // If no structured parts, fallback
  if (!firstName && !lastName) return "Vacant";

  const mid =
    middleInitial
      ? `${middleInitial}.`
      : middleName
      ? `${middleName.charAt(0)}.`
      : "";

  const baseParts = [
    prefix,
    firstName,
    mid,
    lastName,
    suffix,
  ].filter(Boolean);

  const baseName = baseParts.join(" ");

  return postTitle ? `${baseName}, ${postTitle}` : baseName;
};
