import { useEffect } from 'react';

export default function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} | Kyoto Anime`
      : 'Kyoto Anime - Anime Streaming & Discovery';
  }, [title]);
}
