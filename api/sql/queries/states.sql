-- name: ListStates :many
SELECT s.state_id, s.name, s.description, s.slug, s.created_at, s.updated_at,
       COUNT(v.video_id)::int AS video_count
FROM states s
LEFT JOIN videos v ON v.state_id = s.state_id AND v.status = 'active'
GROUP BY s.state_id
ORDER BY s.name;

-- name: GetStateBySlug :one
SELECT s.state_id, s.name, s.description, s.slug, s.created_at, s.updated_at,
       COUNT(v.video_id)::int AS video_count
FROM states s
LEFT JOIN videos v ON v.state_id = s.state_id AND v.status = 'active'
WHERE s.slug = $1
GROUP BY s.state_id;

-- name: GetStateByID :one
SELECT s.state_id, s.name, s.description, s.slug, s.created_at, s.updated_at,
       COUNT(v.video_id)::int AS video_count
FROM states s
LEFT JOIN videos v ON v.state_id = s.state_id AND v.status = 'active'
WHERE s.state_id = $1
GROUP BY s.state_id;

-- name: CreateState :one
INSERT INTO states (name, description)
VALUES ($1, $2)
RETURNING state_id, name, description, slug, created_at, updated_at;

-- name: UpdateState :exec
UPDATE states SET name = $2, description = $3 WHERE state_id = $1;

-- name: DeleteState :exec
DELETE FROM states WHERE slug = $1;

-- name: ListStatesPaginated :many
SELECT s.state_id, s.name, s.description, s.slug, s.created_at, s.updated_at,
       COUNT(v.video_id)::int AS video_count,
       COUNT(*) OVER()::int AS total_count
FROM states s
LEFT JOIN videos v ON v.state_id = s.state_id AND v.status = 'active'
GROUP BY s.state_id
ORDER BY s.name
LIMIT $1 OFFSET $2;
