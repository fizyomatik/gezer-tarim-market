import Categories from "../components/home/Categories";
import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import ServiceSection from "../components/home/ServiceSection";
import ContactSection from "../components/home/ContactSection";
import WhyGezer from "../components/home/WhyGezer";
import { getActiveSlides } from "../lib/catalog";

export default async function Home() {
  const slides = await getActiveSlides();
  return (
    <main><Hero slides={slides} /><Categories /><FeaturedProducts /><ServiceSection /><WhyGezer /><ContactSection /></main>
  );
}
