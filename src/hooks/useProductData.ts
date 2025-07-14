// src/hooks/useProductData.ts
import { useState, useEffect } from "react";
import { getProducts, Product } from "@/data/products";

export const useProductData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          const uniqueCategories = [...new Set(data.map((p) => p.category))];
          setCategories(uniqueCategories);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, categories, loading };
};