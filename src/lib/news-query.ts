import { queryOptions } from "@tanstack/react-query";
import { getNewsFn, getArticleInsightFn } from "./news.functions";

export const newsQueryOptions = () =>
  queryOptions({
    queryKey: ["news"],
    queryFn: () => getNewsFn(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const insightQueryOptions = (input: {
  id: string;
  headline: string;
  summary: string;
  category: string;
}) =>
  queryOptions({
    queryKey: ["insight", input.id],
    queryFn: () => getArticleInsightFn({ data: input }),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
