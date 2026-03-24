-- 즐겨찾기 메모 기능 추가
ALTER TABLE favorite_patents ADD COLUMN IF NOT EXISTS memo TEXT DEFAULT NULL;
