import { NotFoundError } from "../errors/notFoundError";
import { PresetRepository } from "../repositories/presetRepository";
import { UserRepository } from "../repositories/userRepository";

export const PresetService = {
  async getUserKey(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("유저를 찾을 수 없습니다.");
    return user.user_tblkey;
  },

  async create(email: string, body: any) {
    const userId = await this.getUserKey(email);
    return PresetRepository.create(userId, body);
  },

  async list(email: string, skip = 0, limit = 10) {
    const userId = await this.getUserKey(email);
    return PresetRepository.list(userId, skip, limit);
  },

  async get(email: string, presetId: number) {
    const userId = await this.getUserKey(email);
    const row = await PresetRepository.findById(userId, presetId);
    if (!row) throw new NotFoundError();
    return row;
  },

  async update(email: string, presetId: number, patch: any) {
    const userId = await this.getUserKey(email);
    const ok = await PresetRepository.update(userId, presetId, patch);
    if (!ok) throw new NotFoundError();
  },

  async remove(email: string, presetId: number) {
    const userId = await this.getUserKey(email);
    const ok = await PresetRepository.remove(userId, presetId);
    if (!ok) throw new NotFoundError();
  },
};
