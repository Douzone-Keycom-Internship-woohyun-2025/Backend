-- H10 IPC 서브클래스 추가 (2022년 H01L에서 분리된 신설 코드)
INSERT INTO ipc_subclass_map (ipc_subclass, kor_name) VALUES
  ('H10B', '반도체 기억 소자'),
  ('H10D', '무기 반도체 소자'),
  ('H10F', '무기 광감응·열감응 반도체 소자'),
  ('H10H', '무기 발광 반도체 소자 (LED 등)'),
  ('H10K', '유기 반도체 소자'),
  ('H10N', '전기 고체 소자 (압전·열전 등)'),
  ('H10W', '다중 요소 반도체 소자')
ON CONFLICT (ipc_subclass) DO UPDATE SET kor_name = EXCLUDED.kor_name;
