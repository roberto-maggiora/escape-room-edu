import HomeClient from "@/components/HomeClient";
import { getLocale } from "@/lib/i18n";

type HomePageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const params = new URLSearchParams();
  if (resolvedSearchParams.lang) {
    params.set("lang", resolvedSearchParams.lang);
  }
  const locale = getLocale(params);

  return <HomeClient locale={locale} queryString={params.toString()} />;
}
