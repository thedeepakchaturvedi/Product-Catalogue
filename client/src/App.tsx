import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout.js";
import { HomePage } from "./pages/HomePage/HomePage.js";
import { CategoryPage } from "./pages/CategoryPage/CategoryPage.js";
import { SearchResultsPage } from "./pages/SearchResultsPage/SearchResultsPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage/ProductDetailPage.js";
import { EnquiryPage } from "./pages/EnquiryPage/EnquiryPage.js";
import { ThankYouPage } from "./pages/ThankYouPage/ThankYouPage.js";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage.js";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:name" element={<CategoryPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/enquire" element={<EnquiryPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
