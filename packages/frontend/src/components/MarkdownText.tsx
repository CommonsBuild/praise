import linkifyHtml from 'linkify-html';

import { markdownParser } from '@/utils/parser';

export const getMarkdownText = (text: string): string => {
  return linkifyHtml(markdownParser(text), { target: '_blank' });
};
