import { NotFoundError } from "../errors/notFoundError";
import { PresetRepository } from "../repositories/presetRepository";
import { PresetPayload } from "../types/preset";

export const PresetService = {
  async create(userId: number, body: PresetPayload) {
    return PresetRepository.create(userId, body);
  },

  async list(userId: number, skip = 0, limit = 10) {
    return PresetRepository.list(userId, skip, limit);
  },

  async get(userId: number, presetId: number) {
    const row = await PresetRepository.findById(userId, presetId);
    if (!row) throw new NotFoundError("프리셋을 찾을 수 없습니다.");
    return row;
  },

  async update(
    userId: number,
    presetId: number,
    patch: Partial<PresetPayload>
  ) {
    const ok = await PresetRepository.update(userId, presetId, patch);
    if (!ok) throw new NotFoundError("프리셋을 찾을 수 없습니다.");
  },

  async remove(userId: number, presetId: number) {
    const ok = await PresetRepository.remove(userId, presetId);
    if (!ok) throw new NotFoundError("프리셋을 찾을 수 없습니다.");
  },
};
