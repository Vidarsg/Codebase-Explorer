declare module "react-syntax-highlighter" {
  import * as React from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    customStyle?: React.CSSProperties;
    children: string;
  }

  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
}
