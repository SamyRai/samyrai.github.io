module.exports = {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: ["last 2 versions", "> 1%", "not dead"],
    },
    ...(process.env.HUGO_ENVIRONMENT === "production"
      ? {
          "@fullhuman/postcss-purgecss": {
            content: ["./hugo_stats.json"],
            defaultExtractor: (content) => {
              const broadMatches =
                content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
              const innerMatches =
                content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
              return broadMatches.concat(innerMatches);
            },
            safelist: {
              standard: [
                /^breadcrumb/,
                /^toc/,
                /^related/,
                /^reading-progress/,
                /^highlight/,
                /^chroma/,
              ],
              deep: [],
              greedy: [],
            },
          },
          cssnano: {
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true,
                },
                normalizeWhitespace: true,
              },
            ],
          },
        }
      : {}),
  },
};
