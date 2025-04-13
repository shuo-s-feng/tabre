export const convertUrlToPattern = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Chrome extension does not allow localhost with port number
    if (hostname === "localhost") {
      return `http://localhost/*`;
    }

    // If hostname is just the domain without subdomain (e.g., linkedin.com)
    if (hostname.split(".").length === 2) {
      return `*://${hostname}/*`;
    }

    // For URLs with subdomains (e.g., www.linkedin.com)
    const domain = hostname.split(".").slice(-2).join(".");
    return `*://*.${domain}/*`;
  } catch {
    return "";
  }
};
