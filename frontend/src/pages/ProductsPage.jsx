import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import Loader from "../components/Loader.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  //? navbar and home page tiles link here with ?category=xyz
  const categoryParam = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //? categories and brands come from the backend, so filters always match real data
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
  });

  const [selectedCategories, setSelectedCategories] = useState(
    categoryParam ? [categoryParam] : []
  );
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/api/shop/product/filters")
      .then((res) => setFilterOptions(res.data.payload))
      .catch(() => {});
  }, []);

  //! if the user clicks another category in the navbar, tick that one
  useEffect(() => {
    setSelectedCategories(categoryParam ? [categoryParam] : []);
  }, [categoryParam]);

  //! when a search keyword is there we use the search api, otherwise the filter api
  useEffect(() => {
    //? if the user ticks filters quickly, an older response can come back later
    //? and show wrong products, so we ignore it
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      try {
        const res = keyword
          ? await axiosInstance.get(
              `/api/shop/product/search?keyword=${keyword}`
            )
          : await axiosInstance.get("/api/shop/product/all", {
              params: {
                category: selectedCategories.join(","),
                brand: selectedBrands.join(","),
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
                sortBy: sortBy || undefined,
              },
            });

        if (!ignore) setProducts(res.data.payload);
      } catch {
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [keyword, selectedCategories, selectedBrands, minPrice, maxPrice, sortBy]);

  //? tick / untick a checkbox
  const toggle = (value, list, setList) => {
    if (list.includes(value)) setList(list.filter((ele) => ele !== value));
    else setList([...list, value]);
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* left side filters */}
      <aside className="w-full md:w-60 bg-white border border-line p-4 rounded-xl h-fit md:sticky md:top-44">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-bold text-ink-900">Filters</h3>
          <button
            onClick={clearAll}
            className="text-xs text-primary-600 font-semibold hover:underline"
          >
            Clear all
          </button>
        </div>

        {keyword && (
          <p className="text-xs text-ink-500 mb-3 bg-cream-100 p-2 rounded-lg">
            Filters are off while searching
          </p>
        )}

        <p className="font-semibold text-sm mb-2 text-ink-800">Category</p>
        {filterOptions.categories.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-2 text-sm mb-1.5 capitalize text-ink-700 cursor-pointer"
          >
            <input
              type="checkbox"
              className="accent-primary-600"
              checked={selectedCategories.includes(cat)}
              onChange={() =>
                toggle(cat, selectedCategories, setSelectedCategories)
              }
            />
            {cat}
          </label>
        ))}

        <p className="font-semibold text-sm mt-4 mb-2 text-ink-800">Brand</p>
        {filterOptions.brands.map((b) => (
          <label
            key={b}
            className="flex items-center gap-2 text-sm mb-1.5 capitalize text-ink-700 cursor-pointer"
          >
            <input
              type="checkbox"
              className="accent-primary-600"
              checked={selectedBrands.includes(b)}
              onChange={() => toggle(b, selectedBrands, setSelectedBrands)}
            />
            {b}
          </label>
        ))}

        <p className="font-semibold text-sm mt-4 mb-2 text-ink-800">Price</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full border border-line-strong rounded-lg p-1.5 text-sm outline-none focus:border-primary-500"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full border border-line-strong rounded-lg p-1.5 text-sm outline-none focus:border-primary-500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </aside>

      {/* right side products */}
      <section className="flex-1">
        <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold capitalize">
              {keyword
                ? `Results for "${keyword}"`
                : selectedCategories.length === 1
                  ? selectedCategories[0]
                  : "All Products"}
            </h2>
            <p className="text-sm text-ink-500">
              {loading ? "Loading..." : `${products.length} item(s) found`}
            </p>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-line-strong rounded-lg px-4 py-2 text-sm bg-white outline-none focus:border-primary-500"
          >
            <option value="">Sort by</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="aToZ">Name: A to Z</option>
            <option value="zToA">Name: Z to A</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
            <p className="font-display font-bold text-lg mb-1">
              Nothing here yet
            </p>
            <p className="text-ink-500 text-sm">
              Try removing a filter or searching something else.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
