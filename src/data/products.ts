export interface Product {
  id: string;
  category: string;
  imageUrl: string;
  videoUrl?: string; // New optional field for video URL
  name: {
    ua: string;
    ru: string;
    en: string;
  };
  description: {
    ua: string;
    ru: string;
    en: string;
  };
  price: number;
}

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsytl83rbmkbI7k4J8gVzxych7zTg3zAEHcMLSY62x1jcF1s1tsLc2LNd2q4pRCUaNJhIgs__A-0P8/pub?gid=0&single=true&output=csv";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(SHEET_URL);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    // @ts-ignore: Papa is loaded globally from index.html
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        try {
          const products: Product[] = result.data.map((row: any) => ({
            id: row.id,
            category: row.category,
            imageUrl: row.imageUrl,
            videoUrl: row.videoUrl || "",
            name: {
              ua: row.name_ua,
              ru: row.name_ru,
              en: row.name_en,
            },
            description: {
              ua: row.description_ua,
              ru: row.description_ru,
              en: row.description_en,
            },
            price: parseFloat(row.price),
          }));
          resolve(products);
        } catch (err) {
          reject(err);
        }
      },
      error: (err: any) => reject(err),
    });
  });
}