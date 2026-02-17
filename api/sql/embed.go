package sql

import _ "embed"

// Schema contains the full database schema SQL, embedded at compile time.
// All statements are idempotent (IF NOT EXISTS / OR REPLACE), safe to run on every startup.
//
//go:embed schema.sql
var Schema string
