import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProducts, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CallbackForm from "@/components/CallbackForm";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

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

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    let updatedCart: CartItem[];
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          id: product.id,
          name: product.name[language],
          price: product.price,
          image: product.imageUrl,
          quantity: 1,
        },
      ];
    }
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveFromCart = (productId: string) => {
    const itemToRemove = cart.find((item) => item.id === productId);
    let updatedCart: CartItem[];
    if (itemToRemove && itemToRemove.quantity > 1) {
      updatedCart = cart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      updatedCart = cart.filter((item) => item.id !== productId);
    }
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

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
          product.name[language].toLowerCase().includes(query)
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

  const handlePlayVideo = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setIsVideoOpen(true);
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoOpen(false);
    setCurrentVideoUrl("");
  };

  const handleToggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch((err) => {
          console.error("Failed to enter fullscreen:", err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

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

      <div className="container py-8 relative">
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
                                <ProductCard
                                  product={product}
                                  onAddToCart={handleAddToCart}
                                  onPlayVideo={handlePlayVideo}
                                />
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

        <div className="fixed bottom-6 right-6 z-30">
          <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
            <DialogTrigger asChild>
              <Button
                className="relative rounded-full p-3 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("cart")}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    {t("cart_empty")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.quantity}`}
                        className="flex items-center gap-4 border-b pb-4"
                      >
                        <img
                          src={
                            item.image.includes("?")
                              ? item.image
                              : `${item.image}?w=100&h=75&fit=crop&crop=entropy&auto=format&q=80`
                          }
                          alt={item.name}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {item.quantity > 1 ? `${item.quantity} x ${item.name}` : item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.price * item.quantity} {t("price_per_day")}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    ))}
                    <CallbackForm
                      cart={cart}
                      onSuccess={() => {
                        setCart([]);
                        localStorage.removeItem("cart");
                        setIsCartOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isVideoOpen && currentVideoUrl && (
          <div className="fixed inset-8 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <div className="relative w-[80%] max-w-4xl">
              <video
                ref={videoRef}
                src={currentVideoUrl}
                controls
                className="w-full h-auto rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
              <Button
                className="absolute top-2 right-2 bg-red-500 text-white"
                onClick={handleCloseVideo}
              >
                Close
              </Button>
              <Button
                className="absolute top-2 left-2 bg-blue-500 text-white"
                onClick={handleToggleFullscreen}
              >
                {document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Categories;