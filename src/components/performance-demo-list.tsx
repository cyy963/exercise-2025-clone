"use client";

import { useState, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { PerformanceDemoItem } from "./performance-demo-item";

// Generate a large dataset
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is a description for item ${i}. It contains some text that makes each item unique.`,
    price: Math.floor(Math.random() * 1000) + 10,
    category: `Category ${i % 10}`,
    tags: [`tag${i % 5}`, `tag${(i + 1) % 5}`, `tag${(i + 2) % 5}`],
    inStock: Math.random() > 0.3,
    rating: Math.floor(Math.random() * 5) + 1,
  }));
};

const ITEMS = generateItems(5000); // 5000 items to cause performance issues

export function PerformanceDemoList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Memoize filtered and sorted items
  const sortedItems = useMemo(() => {
    const filteredItems = ITEMS.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesStock = !showInStockOnly || item.inStock;
      return matchesSearch && matchesCategory && matchesStock;
    });
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedCategory, sortBy, showInStockOnly]);

  // Generate categories for filter
  const categories = useMemo(() => ["all", ...Array.from(new Set(ITEMS.map(item => item.category)))], []);

  // Row renderer for react-window
  const Row = ({ index, style, data }: any) => {
    const item = data.items[index];
    return (
      <div style={style}>
        <PerformanceDemoItem item={item} searchTerm={data.searchTerm} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls that cause re-renders */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">In stock only</span>
            </label>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {sortedItems.length} of {ITEMS.length} items
        </div>
      </div>
      {/* Virtualized list */}
      <List
        height={800}
        itemCount={sortedItems.length}
        itemSize={220}
        width={"100%"}
        itemData={{ items: sortedItems, searchTerm }}
      >
        {Row}
      </List>
    </div>
  );
}