import HomeClient from "@/components/HomeClient";
import { getLocale } from "@/lib/i18n";

type HomePageProps = {
  searchParams?: {
    lang?: string;
  };
};

export default function Home({ searchParams }: HomePageProps) {
  const params = new URLSearchParams();
  if (searchParams?.lang) {
    params.set("lang", searchParams.lang);
  }
  const locale = getLocale(params);

  return <HomeClient locale={locale} queryString={params.toString()} />;
}
