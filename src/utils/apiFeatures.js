// sıralama, filtreleme, alan limitleme, sayfalama gibi özelliklere projede defalarca ihtiyaç duyduğumuzdan dolayı her gerektiğinde bu özellikleri ve en baştan yazmamak için yeniden kullanılabilir bir sınıf içerisinde tanımlayalım

class APIFetature {
  constructor(query, queryParams, parsedQuery) {
    this.query = query; // veritabanı sorgusu
    this.queryParams = queryParams; // arama parametreleri
    this.parsedQuery = parsedQuery; // işlenmiş arama parametreleri
  }

  filter() {
    this.query = this.query.find(this.parsedQuery);
    return this;
  }
  sort() {
    if (this.queryParams.sort) {
      this.query.sort(this.queryParams.sort.replaceAll(",", " "));
    }
    return this;
  }

  select() {
    if (this.queryParams.fields) {
      this.query.select(this.queryParams.fields.replaceAll(",", " "));
    }
    return this;
  }
  pagination() {
    // eğer sayfa parametresi varsa
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;

    this.query.limit(limit).skip((page - 1) * limit);
    return this;
  }
}

export default APIFetature;
