// Örn: Bir belgeyi silme işlemi proje içerisinde sadece model ismi değiştirerek defalarca ayrı ayrı yazılıp kod tekrarına sebep oluyor. Bu rounu önlemek için hangi model üzerinde işlem yapılacağını parametre olarak alan bir fonksiyon yazıp kod tekrarını önleyeceğiz (factory patternq)

import APIFetature from "./apiFeatures.js";
import catchAsync from "./catchAsync.js";
import { NotFound } from "./error.js";

// Delete
export const deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    const found = await Model.findByIdAndDelete(req.params.id);

    if (!found) throw new NotFound();

    res.status(204).json({ message: "İçerik kaldırıldı." });
  });

// update
export const updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const found = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!found) throw new NotFound();

    res.status(200).json({ message: "İçerik güncellendi.", data: found });
  });

// create
export const createOne = (Model) =>
  catchAsync(async (req, res) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({
      message: "İçerik oluşturuldu.",
      data: newDocument,
    });
  });

// getOne
export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    let query = await Model.findById(req.params.id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const found = await query;

    if (!found) throw new NotFound();

    res
      .status(200)
      .json({ message: "Aradığınız içerik bulundu.", data: found });
  });

// getAll
export const getAll = (Model) =>
  catchAsync(async (req, res) => {
    const features = new APIFetature(Model.find(), req.query, req.parsedQuery)
      .sort()
      .filter()
      .select()
      .pagination();

    const docs = await features.query;

    res.status(200).json({
      message: "İçerik listelendi.",
      results: docs.length,
      data: docs,
    });
  });
