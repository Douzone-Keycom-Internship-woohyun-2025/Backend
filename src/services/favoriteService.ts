import { pool } from "../config/db";
import { FavoriteRepository } from "../repositories/favoriteRepository";
import { patentIpcSubclassRepository } from "../repositories/patentIpcSubclassRepository";
import { FavoritePayload } from "../types/favorite";
import { NotFoundError } from "../errors/notFoundError";
import { BadRequestError } from "../errors/badRequestError";
import { extractSubclass } from "../utils/ipc";

export const FavoriteService = {
  async create(userId: number, payload: FavoritePayload) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 필수값 체크
      if (!payload.applicationNumber)
        throw new BadRequestError("출원번호는 필수입니다.");
      if (!payload.inventionTitle)
        throw new BadRequestError("발명의 명칭은 필수입니다.");
      if (!payload.applicantName)
        throw new BadRequestError("출원인명은 필수입니다.");
      if (!payload.applicationDate)
        throw new BadRequestError("출원일은 필수입니다.");

      // 중복 체크
      const existing = await FavoriteRepository.findByApplicationNumber(
        userId,
        payload.applicationNumber
      );
      if (existing)
        throw new BadRequestError("이미 즐겨찾기에 추가된 특허입니다.");

      // 즐겨찾기 등록
      const favorite = await FavoriteRepository.create(userId, payload);

      // IPC subclass 매핑 저장
      if (payload.ipcNumber?.trim()) {
        const rawCodes = payload.ipcNumber.split("|").map((v) => v.trim());

        const subclassList = rawCodes
          .map((c) => extractSubclass(c))
          .filter((v): v is string => v !== null);

        if (subclassList.length > 0) {
          await patentIpcSubclassRepository.addMappings(
            favorite.patent_tblkey,
            subclassList
          );
        }
      }

      await client.query("COMMIT");
      return favorite;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async list(userId: number) {
    return FavoriteRepository.list(userId);
  },

  async get(userId: number, applicationNumber: string) {
    const favorite = await FavoriteRepository.findByApplicationNumber(
      userId,
      applicationNumber
    );
    if (!favorite) throw new NotFoundError("즐겨찾기를 찾을 수 없습니다.");
    return favorite;
  },

  async remove(userId: number, applicationNumber: string) {
    const deleted = await FavoriteRepository.delete(userId, applicationNumber);
    if (!deleted) throw new NotFoundError("즐겨찾기를 찾을 수 없습니다.");
  },
};
