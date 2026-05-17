import { queryOptions } from "@tanstack/react-query";
import { getNewsFn, getArticleInsightFn, type NewsScope } from "./news.functions";

export const newsQueryOptions = (category: NewsScope = "All") =>
  queryOptions({
    queryKey: ["news", category],
    queryFn: () => getNewsFn({ data: { category } }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
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
