export const fillTemplateWithParams = (
  template: string,
  params: Record<string, string>
) => {
  let value = template;
  Object.entries(params).forEach(([paramName, paramValue]) => {
    // Check if the value is already URI encoded by trying to decode it
    // If the decoded value is different from the original, it was encoded
    const isAlreadyEncoded = decodeURIComponent(paramValue) !== paramValue;
    const finalValue = isAlreadyEncoded
      ? paramValue
      : encodeURIComponent(paramValue);
    value = value.replaceAll(`{{${paramName}}}`, finalValue);
  });

  // Throw an error if the template contains unmatched placeholders
  if (!value.includes("{{cs_") && value.includes("{{")) {
    throw new Error("Invalid template: " + value);
  }

  // Replace all `{{cs_` placeholders with `{{` to pass to Chrome Extension to continue filling the template
  value = value.replaceAll("{{cs_", "{{");
  return value;
};
