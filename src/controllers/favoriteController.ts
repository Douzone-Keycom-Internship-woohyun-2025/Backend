import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { FavoriteService } from "../services/favoriteService";

export const createFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const payload = req.body;

    const favorite = await FavoriteService.create(userId, payload);

    return res.status(201).json({
      status: "success",
      message: "즐겨찾기가 추가되었습니다.",
      data: {
        id: favorite.patent_tblkey,
        applicationNumber: favorite.application_number,
        inventionTitle: favorite.invention_title,
        applicantName: favorite.applicant_name,
        abstract: favorite.abstract,
        applicationDate: favorite.application_date,
        openNumber: favorite.open_number,
        publicationNumber: favorite.publication_number,
        publicationDate: favorite.publication_date,
        registerNumber: favorite.register_number,
        registerDate: favorite.register_date,
        registerStatus: favorite.register_status,
        drawingUrl: favorite.drawing_url,
        createdAt: favorite.adddate,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const favorites = await FavoriteService.list(userId);

    return res.json({
      status: "success",
      message: "즐겨찾기 목록 조회 성공",
      data: {
        total: favorites.length,
        favorites: favorites.map((f) => ({
          id: f.patent_tblkey,
          applicationNumber: f.application_number,
          inventionTitle: f.invention_title,
          applicantName: f.applicant_name,
          abstract: f.abstract,
          applicationDate: f.application_date,
          openNumber: f.open_number,
          publicationNumber: f.publication_number,
          publicationDate: f.publication_date,
          registerNumber: f.register_number,
          registerDate: f.register_date,
          registerStatus: f.register_status,
          drawingUrl: f.drawing_url,
          createdAt: f.adddate,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const applicationNumber = req.params.applicationNumber;

    const favorite = await FavoriteService.get(userId, applicationNumber);

    return res.json({
      status: "success",
      data: {
        id: favorite.patent_tblkey,
        applicationNumber: favorite.application_number,
        inventionTitle: favorite.invention_title,
        applicantName: favorite.applicant_name,
        abstract: favorite.abstract,
        applicationDate: favorite.application_date,
        openNumber: favorite.open_number,
        publicationNumber: favorite.publication_number,
        publicationDate: favorite.publication_date,
        registerNumber: favorite.register_number,
        registerDate: favorite.register_date,
        registerStatus: favorite.register_status,
        drawingUrl: favorite.drawing_url,
        createdAt: favorite.adddate,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const applicationNumber = req.params.applicationNumber;

    await FavoriteService.remove(userId, applicationNumber);

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};
