---
summary: Guide for running tests and adding regression coverage for converters.
read_when:
  - adding or updating converters
  - fixing a regression
  - touching test commands or tooling
---

# Testing Guide

This repo relies on quick, targeted tests to keep every converter stable as we add new domains and SEO pages.

## Goals
- Keep detection, normalization, and conversion logic correct for all modules.
- Encode fixes as tests so regressions cannot sneak back in.
- Keep the test suite fast enough to run on every change.

## Commands
- Run all tests: `./runner pnpm test` (wraps `bun test`).
- Type checks: `./runner pnpm typecheck`.
- Full lint pass: `./runner pnpm lint`.

## Expectations
- Add unit tests alongside code under `src/**/__tests__` that cover detection success/failure, resolver selection, and output formatting.
- When adding a new converter, include tests for its happy paths and edge cases before wiring it into the registry.

## Regression Rule
- Whenever Anton mentions a regression (in chat, issues, or PR feedback), first reproduce it with a failing test and keep that test in the suite when the fix lands. No regression fix ships without its test.
