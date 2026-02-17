-- name: ListSublocationsByState :many
SELECT sub.sublocation_id, sub.name, sub.description, sub.state_id, sub.slug,
       sub.created_at, sub.updated_at,
       s.name AS state_name,
       COUNT(v.video_id)::int AS video_count
FROM sublocations sub
JOIN states s ON s.state_id = sub.state_id
LEFT JOIN videos v ON v.sublocation_id = sub.sublocation_id AND v.status = 'active'
WHERE sub.state_id = $1
GROUP BY sub.sublocation_id, s.name
ORDER BY sub.name;

-- name: GetSublocationBySlug :one
SELECT sub.sublocation_id, sub.name, sub.description, sub.state_id, sub.slug,
       sub.created_at, sub.updated_at,
       s.name AS state_name,
       COUNT(v.video_id)::int AS video_count
FROM sublocations sub
JOIN states s ON s.state_id = sub.state_id
LEFT JOIN videos v ON v.sublocation_id = sub.sublocation_id AND v.status = 'active'
WHERE sub.slug = $1
GROUP BY sub.sublocation_id, s.name;

-- name: GetSublocationByID :one
SELECT sub.sublocation_id, sub.name, sub.description, sub.state_id, sub.slug,
       sub.created_at, sub.updated_at,
       s.name AS state_name,
       COUNT(v.video_id)::int AS video_count
FROM sublocations sub
JOIN states s ON s.state_id = sub.state_id
LEFT JOIN videos v ON v.sublocation_id = sub.sublocation_id AND v.status = 'active'
WHERE sub.sublocation_id = $1
GROUP BY sub.sublocation_id, s.name;

-- name: CreateSublocation :one
INSERT INTO sublocations (name, description, state_id)
VALUES ($1, $2, $3)
RETURNING sublocation_id, name, description, state_id, slug, created_at, updated_at;
