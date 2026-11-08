import { useId } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import type { ContentSummary, Product, Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";
import { ServiceCard } from "../components/ServiceCard";
import { ProductCard } from "../components/ProductCard";
import { ErrorState } from "../components/ui";
import "./home.css";
import { MotionScene } from "../components/MotionScene";

export const Route = createFileRoute("/")({ component: HomePage });

// Each bee needs its own clip path, including when React renders multiple copies.
function Bee({ position, magnifier = false }: { position: string; magnifier?: boolean }) {
  const clipId = useId();
  return <svg className={`fia-bee ${position}`} viewBox="0 0 340 320" aria-hidden="true">
    <path className="fia-wing back" d="M188 127C224 54 177 -3 84 8L151 103Z" fill="white" />
    <path d="m54 169-25 7 24 10" fill="#383030" />
    <g fill="none" stroke="#3658D3" strokeWidth="7"><path d="M99 229q-9 20-27 15M127 240q-7 21-28 19M190 235q-6 29 19 42M217 224l28 28" /></g>
    <ellipse cx="145" cy="178" rx="100" ry="87" fill="#FFD37D" />
    <defs><clipPath id={clipId}><ellipse cx="145" cy="178" rx="100" ry="87" /></clipPath></defs>
    <g clipPath={`url(#${clipId})`} fill="#383030"><path d="m94 75 42 8-30 194-43-12zM180 74l45 8-30 196-45-6z" /></g>
    <path d="M295 172A43 43 0 1 0 288 195Q281 195 278 184Q286 187 294 185Q295 178 295 172Z" fill="#FFD37D" />
    <path d="M270 137C277 127 287 120 298 119M273 142C281 135 293 131 308 131" fill="none" stroke="#383030" strokeWidth="3" strokeLinecap="round" />
    <circle cx="279" cy="172" r="3.3" fill="#383030" />
    <path className="fia-wing front" d="M159 174C194 80 91 29 8 72Z" fill="white" />
    {magnifier ? <g transform="translate(510 0) scale(-1 1)"><circle cx="255" cy="210" r="27" fill="#D6E3EF" fillOpacity=".55" stroke="#383030" strokeWidth="7" /><path d="m274 230 28 29" stroke="#3658D3" strokeWidth="12" strokeLinecap="round" /><path d="M242 207q1-12 13-13" fill="none" stroke="white" strokeWidth="4" /></g> : <g transform="translate(210 263) rotate(-38)"><path d="M3 0v-17h35V0" fill="none" stroke="#3658D3" strokeWidth="5" /><path d="M-5 0h52v53H-5z" fill="#383030" /><path d="M-9 9v49h53" fill="none" stroke="#70A2E1" strokeWidth="3" /></g>}
  </svg>;
}

export default function HomePage() {
  const { t, pick, formatDate } = useI18n();
  const services = useQuery({ queryKey: ["services"], queryFn: () => api<{services: Service[]}>("/services") });
  const products = useQuery({ queryKey: ["products", "featured"], queryFn: () => api<{products: Product[]}>("/products?featured=true") });
  const content = useQuery({ queryKey: ["content", "home"], queryFn: () => api<{pages: ContentSummary[]}>("/content") });
  function queryStatus(query: {isPending: boolean; isError: boolean; refetch: () => unknown}, count: number) {
    if (query.isPending) return <p role="status" className="fia-query-status">{t("common.loading")}</p>;
    if (query.isError) return <ErrorState onRetry={() => { void query.refetch(); }} />;
    if (!count) return <p className="fia-query-status">{t("home.designEmpty")}</p>;
    return null;
  }
  const serviceItems = services.data?.services ?? [];
  const productItems = (products.data?.products ?? []).slice(0, 6);
  const articles = (content.data?.pages ?? []).slice(0, 3);
  return <div className="fia-home">
    <MotionScene><div className="fia-clouds"><i /><i /><i /><i /></div><div className="fia-bees"><Bee position="a" /><Bee position="b" magnifier /><Bee position="c" /></div></MotionScene>
    <section className="fia-hero fia-container"><h1>{t("home.designLine1")}<br />{t("home.designLine2")}</h1><div><h2>{t("home.designSubtitle")}</h2><p>{t("home.designIntro")}</p><Link to="/services" className="ds-btn ds-btn-primary">{t("home.ctaServices")} <ArrowRight size={16}/></Link></div></section>
    <section className="fia-stat-section"><div className="fia-container fia-stats">{[["120+","home.statProjects"],["< 4 h","home.statResponse"],["40+","home.statClients"],["98%","home.statSatisfaction"]].map(([value,key])=><div key={key}><strong>{value}</strong><p>{t(key as TranslationKey)}</p></div>)}</div><p className="fia-container fia-metrics-note">{t("home.demoMetrics")}</p></section>
    <section className="fia-section"><div className="fia-container"><p className="fia-label">{t("home.servicesEyebrow")}</p><h2>{t("home.servicesTitle")}</h2><p className="fia-intro">{t("home.servicesText")}</p>{queryStatus(services, serviceItems.length)}<div className="fia-catalog">{serviceItems.map(service=><ServiceCard key={service.id} service={service}/>)}</div></div></section>
    <section className="fia-section fia-white"><div className="fia-container"><p className="fia-label">{t("home.processEyebrow")}</p><h2>{t("home.processTitle")}</h2><p className="fia-intro">{t("home.processText")}</p><div className="fia-process">{Array.from({length:8},(_,i)=><article key={i}><span className="fia-number">{String(i+1).padStart(2,"0")}</span><h3>{t(`home.step${i+1}.title` as TranslationKey)}</h3><p>{t(`home.step${i+1}.text` as TranslationKey)}</p></article>)}</div></div></section>
    <section className="fia-section fia-yellow"><div className="fia-container"><p className="fia-label">{t("home.productsEyebrow")}</p><h2>{t("home.designShop")}</h2><p className="fia-intro">{t("home.productsText")}</p>{queryStatus(products,productItems.length)}<div className="fia-catalog fia-products">{productItems.map(product=><ProductCard key={product.id} product={product}/>)}</div><Link to="/products" className="ds-btn ds-btn-outline fia-more">{t("products.title")} <ArrowRight size={16}/></Link></div></section>
    <section className="fia-section fia-white"><div className="fia-container"><p className="fia-label">{t("home.whyEyebrow")}</p><h2>{t("home.whyTitle")}</h2><p className="fia-intro">{t("home.whyText")}</p><div className="fia-reasons">{[1,2,3,4].map(n=><article key={n}><h3>{t(`home.why${n}.title` as TranslationKey)}</h3><p>{t(`home.why${n}.text` as TranslationKey)}</p></article>)}</div><div className="fia-trust"><h3>{t("home.trusted")}</h3><p>{t("home.whyText")}</p></div></div></section>
    <section className="fia-section fia-pink"><div className="fia-container"><p className="fia-label">{t("home.blogEyebrow")}</p><h2>{t("home.blogTitle")}</h2><p className="fia-intro">{t("home.blogText")}</p>{queryStatus(content,articles.length)}<div className="fia-catalog">{articles.map(article=><Link className="fia-article" key={article.id} to="/blog/$slug" params={{slug:article.slug}}><small>{formatDate(article.publishedAt||article.updatedAt)}</small><h3>{pick(article.titleEn,article.titleDe)}</h3><p>{pick(article.excerptEn,article.excerptDe)}</p><span>{t("home.readMore")} <ArrowRight size={16}/></span></Link>)}</div></div></section>
    <section className="fia-section fia-cta fia-container"><h2>{t("home.ctaTitle")}</h2><p>{t("home.ctaText")}</p><div><Link to="/quote" search={{service:undefined}} className="ds-btn ds-btn-primary">{t("home.ctaButton")}</Link><Link to="/contact" className="ds-btn ds-btn-primary">{t("nav.contact")}</Link></div></section>
  </div>;
}
