# Scoped Sync Architecture

**Date:** 2026-01-22

## Problem

Single data source, multiple devices with different access needs.
Work laptop shouldn't see personal life stuff.

## Profile Hierarchy

```
full (everything)
  └── work (business mind, no personal)
        ├── work-companyA (+ companyA data)
        └── work-companyB (+ companyB data)
```

## Approach: Profiles Pick, Not Files

Files don't know their scope. Profiles define what they include.

```yaml
# profiles/work.yaml
base: full
exclude:
  - context/identity/
  - context/relationships/
  - "**/personal*"
```

One file can appear in multiple profiles - no duplication.

## Scoped Indexes

Each directory can have scoped index files:

```
context/
├── index.md           # Full view
├── index.work.md      # Work view (excludes personal)
```

Sync pulls index for your profile, then files it references.

## Device Auth

```yaml
devices:
  - id: macbook-personal
    token: "sk-abc..."
    profile: full
  - id: macbook-work
    token: "sk-def..."
    profile: work-companyA
```

Simple tokens, no full account system for personal use.
