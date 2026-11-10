function getAllowedOrigins() {
  const configuredOrigins = process.env.CLIENT_URL || "http://localhost:5173";
  return configuredOrigins.split(",").map((entry) => {
    const value = entry.trim();
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error("CLIENT_URL must contain valid HTTP or HTTPS origins");
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password ||
      (url.pathname !== "/" && url.pathname !== "") ||
      url.search ||
      url.hash
    ) {
      throw new Error("CLIENT_URL must contain valid HTTP or HTTPS origins");
    }
    return url.origin;
  });
}

module.exports = getAllowedOrigins;
