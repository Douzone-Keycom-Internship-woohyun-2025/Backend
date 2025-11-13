import { PresetRepository } from "../repositories/presetRepository";

export const PresetService = {
  create(
    userId: number,
    body: {
      presetName: string;
      applicant: string;
      startDate: string;
      endDate: string;
      description?: string;
    }
  ) {
    return PresetRepository.create(userId, body);
  },

  list(userId: number, skip = 0, limit = 10) {
    return PresetRepository.list(userId, skip, limit);
  },

  async get(userId: number, presetId: number) {
    const row = await PresetRepository.findById(userId, presetId);
    if (!row) throw new Error("NOT_FOUND");
    return row;
  },

  async update(
    userId: number,
    presetId: number,
    patch: Partial<{
      presetName: string;
      applicant: string;
      startDate: string;
      endDate: string;
      description: string | null;
    }>
  ) {
    const ok = await PresetRepository.update(userId, presetId, patch);
    if (!ok) throw new Error("NOT_FOUND");
  },

  async remove(userId: number, presetId: number) {
    const ok = await PresetRepository.remove(userId, presetId);
    if (!ok) throw new Error("NOT_FOUND");
  },
};
