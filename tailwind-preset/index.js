const morok = require('./morok.js')

// Re-export the morok palette preset, augmented with a content glob pointing
// at this package's component sources. Without this, Tailwind's content
// scanner only sees the consuming site's files and prunes every class used
// inside `pivoshenko.ui` components (Footer, Nav, PageShell, Tag, Card, ...).
module.exports = {
  ...morok,
  content: ['./node_modules/pivoshenko.ui/ui/src/**/*.{ts,tsx}'],
}
