/**
 * pai-investigate library exports
 *
 * Barrel file for clean imports: `import { investigate } from './lib'`
 */

// Core investigation function
export { investigate, type InvestigationResult, type InvestigationOptions } from "./investigate.ts";

// Rate limiting
export { checkRateLimit, formatRateLimitMessage, type RateLimitStatus } from "./rate-limit.ts";

// URL parsing
export { parseGitHubUrl, type GitHubRepo } from "./url-parser.ts";

// GitHub API client
export {
  getRepoMetadata,
  getReadme,
  getTree,
  type RepoMetadata,
  type TreeInfo,
} from "./api-client.ts";

// Report generation
export {
  generateReport,
  saveReport,
  generateInlineSummary,
  type InvestigationReport,
  type InvestigationMode,
} from "./report.ts";

// Entry point detection
export {
  detectEntryPoints,
  detectKeyDirectories,
  type EntryPoint,
  type KeyDirectory,
  type EntryPointType,
} from "./entry-points.ts";

// Dependency parsing
export {
  parseDependencies,
  parsePackageJson,
  parseCargoToml,
  parsePyprojectToml,
  parseRequirementsTxt,
  parseGoMod,
  parseGemfile,
  type DependencyInfo,
} from "./dependencies.ts";

// Learning extraction
export {
  extractLearnings,
  saveLearning,
  saveAllLearnings,
  type InvestigationLearning,
} from "./learnings.ts";

// Pattern types and storage
export {
  // Types
  type PatternType,
  type AutomationLevel,
  type PaiRelevance,
  type PatternSource,
  type ExtractedPattern,
  type IntegrationType,
  type PatternIntegration,
  AUTONOMY_MAP,
  isAutoApply,
  requiresReview,
} from "./patterns/types.ts";

export {
  // Storage
  type PatternStatus,
  type PatternIndexEntry,
  type PatternIndex,
  PATTERNS_DIR,
  APPROVED_DIR,
  INDEXES_DIR,
  loadPatternIndex,
  updatePatternIndex,
  generatePatternId,
  formatPatternMarkdown,
  savePattern,
  getApprovedPatterns,
  getPendingPatterns,
} from "./patterns/storage.ts";

export {
  // Extraction
  extractPatterns,
  assessPaiRelevance,
  findExistingAlternative,
  inferPatternType,
  buildPatternTags,
} from "./patterns/extractor.ts";

export {
  // Integration
  type SkillProposal as IntegrationSkillProposal,
  type RuleModification as IntegrationRuleModification,
  type IntegrationOutput,
  isSkillCandidate,
  categorizeIntegrations,
  applyAutoIntegrations,
  formatIntegrationSummary,
} from "./patterns/integration.ts";

export {
  // Proposals
  type SkillProposal,
  type RuleModification,
  PENDING_DIR,
  createSkillProposal,
  generateSkillSkeleton,
  createRuleProposal,
  formatProposalMarkdown,
  saveProposal,
  getPendingProposals,
} from "./patterns/proposals.ts";

// Semantic search modules
export {
  // Embeddings
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  checkOllamaAvailable,
  checkEmbeddingModel,
  generateEmbedding,
  generateEmbeddings,
} from "./semantic/embeddings.ts";

export {
  // Orama index management
  type PatternDocument,
  type PatternIndex as OramaPatternIndex,
  createPatternIndex,
  insertPattern,
  saveIndex,
  loadIndex,
} from "./semantic/index.ts";

export {
  // Search
  type SearchResult,
  type SearchOptions,
  semanticSearch,
  keywordSearch,
  hybridSearch,
} from "./semantic/search.ts";

export {
  // Pattern indexer
  type IndexingResult,
  indexPatterns,
  indexAndPersist,
  queryPatterns,
  queryAllPatterns,
  listIndexedRepos,
} from "./semantic/indexer.ts";

// Discovery modules (Phase 10)
export {
  // Types
  type SearchResult as DiscoverySearchResult,
  type SearchQuery,
  type SearchOptions as DiscoverySearchOptions,
  formatSearchResults,
  formatStars,
} from "./discovery/types.ts";

export {
  // Search
  searchRepos,
  buildSearchQuery,
  DEFAULT_SEARCH_OPTIONS,
} from "./discovery/search.ts";

export {
  // Suggestions
  type SuggestionContext,
  type Suggestion,
  extractSuggestionContext,
  buildSuggestionQueries,
  generateSuggestions,
  formatSuggestions,
} from "./discovery/suggestions.ts";

export {
  // Queue
  type QueueEntry,
  QUEUE_PATH,
  addToQueue,
  getQueuedRepos,
  markInvestigated,
  getQueueCount,
  formatQueueStatus,
} from "./discovery/queue.ts";

export {
  // Result context
  type SearchContext,
  CONTEXT_PATH,
  saveSearchContext,
  getSearchContext,
  resolveReference,
  clearSearchContext,
} from "./discovery/result-context.ts";
