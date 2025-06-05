import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProducts, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Categories: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; category: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getProducts()
      .then((data) => {
        setProducts(data);
        const uniqueCategories = [...new Set(data.map((p) => p.category))];
        setCategories(uniqueCategories);

        if (categoryId && uniqueCategories.includes(categoryId)) {
          setSelectedCategory(categoryId);
        } else {
          setSelectedCategory(uniqueCategories[0] || "");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [categoryId]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    navigate(`/categories/${category}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.length >= 2) {
      const results = products
        .filter((product) =>
          product.name[language].toLowerCase().includes(query),
        )
        .map((product) => ({
          id: product.id,
          name: product.name[language],
          category: product.category,
        }));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleProductClick = (category: string, productId: string) => {
    setSelectedCategory(category);
    navigate(`/categories/${category}`);
    setTimeout(() => {
      const productElement = document.getElementById(`product-${productId}`);
      if (productElement) {
        productElement.scrollIntoView({ behavior: "smooth" });
        productElement.classList.add("bg-secondary/50");
        setTimeout(() => {
          productElement.classList.remove("bg-secondary/50");
        }, 2000);
      }
    }, 100);
  };

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory,
  );

  // Dynamic SEO based on selected category
  const pageTitle = selectedCategory
    ? `${t(selectedCategory)} | VideoSoundEvent`
    : "Categories | VideoSoundEvent";
  const pageDescription = selectedCategory
    ? `Browse ${t(selectedCategory)} products on VideoSoundEvent. Rent high-quality equipment for events in Ukraine.`
    : "Browse and discover products organized by categories on VideoSoundEvent. Rent equipment for events in Ukraine.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link
          rel="canonical"
          href={`https://videosoundevents.com/categories${selectedCategory ? `/${selectedCategory}` : ""}`}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta
          property="og:url"
          content={`https://videosoundevents.com/categories${selectedCategory ? `/${selectedCategory}` : ""}`}
        />
      </Helmet>

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">{t("categories")}</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">{t("loading")}</p>
          </div>
        ) : (
          <>
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder={t("search_products")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />

              {searchResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <h3 className="text-sm font-medium mb-2">
                      {t("search_results")}
                    </h3>
                    <ul className="space-y-1">
                      {searchResults.map((result) => (
                        <li
                          key={result.id}
                          className="px-2 py-1.5 hover:bg-secondary rounded-md cursor-pointer text-sm"
                          onClick={() =>
                            handleProductClick(result.category, result.id)
                          }
                        >
                          {result.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <Tabs
                value={selectedCategory}
                onValueChange={handleCategoryChange}
                orientation="vertical"
                className="w-full"
              >
                <div className="md:flex">
                  <div className="md:sticky md:top-20 md:self-start">
                    <TabsList className="flex flex-col h-auto w-full md:w-48 space-y-1 p-1 bg-muted/80 backdrop-blur-sm">
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="justify-start w-full py-2.5 px-3 text-left text-sm"
                        >
                          {t(category)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="flex-1 md:pl-8 mt-6 md:mt-0">
                    {categories.map((category) => (
                      <TabsContent
                        key={category}
                        value={category}
                        className="m-0"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                              <div
                                id={`product-${product.id}`}
                                key={product.id}
                                className="transition-all duration-300"
                              >
                                <ProductCard product={product} />
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-12">
                              <p className="text-lg text-muted-foreground">
                                {t("no_products")}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Categories;
