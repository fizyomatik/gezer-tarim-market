import Categories from "../components/home/Categories";
import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import ServiceSection from "../components/home/ServiceSection";
import ContactSection from "../components/home/ContactSection";
import WhyGezer from "../components/home/WhyGezer";

export default function Home() {
  return (
    <main><Hero /><Categories /><FeaturedProducts /><ServiceSection /><WhyGezer /><ContactSection /></main>
  );
}
