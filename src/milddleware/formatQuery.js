import qs from "qs";

const formatQuery = (req, res, next) => {
  //  client'dan gelen parametre formatı: { 'price[gt]': '10000', 'rating[lt]': '5' }
  // mongodb'nin istediği format: { price:{$gt:1000 }, rating:{$lt: 5}}

  // 1 - urldeki arama parametresin eriş
  let queryObj = qs.parse(req.query);

  // 2 - arama parametreleri arasında sort, fields,page, limit parametrelerini kaldır
  const fields = ["sort", "limit", "page", "fields"];
  fields.forEach((i) => delete queryObj[i]);

  // 3- string methodları kullanabilmek için parametre nesnesini stringe cevir
  let queryStr = JSON.stringify(queryObj);

  // 4- bütün operatörlerin başına $ koy
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|ne)\b/g,
    (found) => `$${found}`,
  );

  // 5- queryStr yi nesne formatına cevir
  const parsedQuery = JSON.parse(queryStr);

  // 6- req nesnesi içerisine parametreleri ekle
  req.parsedQuery = parsedQuery;

  // sonraki fonksiyonun çalışmasına izin ver
  next();
};

export default formatQuery;
