import { FavoriteRepository } from "../repositories/favoriteRepository";
import { FavoritePayload } from "../types/favorite";
import { NotFoundError } from "../errors/notFoundError";
import { BadRequestError } from "../errors/badRequestError";

export const FavoriteService = {
  async create(userId: number, payload: FavoritePayload) {
    if (!payload.applicationNumber) {
      throw new BadRequestError("출원번호는 필수입니다.");
    }
    if (!payload.inventionTitle) {
      throw new BadRequestError("발명의 명칭은 필수입니다.");
    }
    if (!payload.applicantName) {
      throw new BadRequestError("출원인명은 필수입니다.");
    }
    if (!payload.applicationDate) {
      throw new BadRequestError("출원일은 필수입니다.");
    }

    const existing = await FavoriteRepository.findByApplicationNumber(
      userId,
      payload.applicationNumber
    );

    if (existing) {
      throw new BadRequestError("이미 즐겨찾기에 추가된 특허입니다.");
    }

    return FavoriteRepository.create(userId, payload);
  },

  async list(userId: number) {
    return FavoriteRepository.list(userId);
  },

  async get(userId: number, applicationNumber: string) {
    const favorite = await FavoriteRepository.findByApplicationNumber(
      userId,
      applicationNumber
    );

    if (!favorite) {
      throw new NotFoundError("즐겨찾기를 찾을 수 없습니다.");
    }

    return favorite;
  },

  async remove(userId: number, applicationNumber: string) {
    const deleted = await FavoriteRepository.delete(userId, applicationNumber);

    if (!deleted) {
      throw new NotFoundError("즐겨찾기를 찾을 수 없습니다.");
    }
  },
};
