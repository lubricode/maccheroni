import React from "types/react";

export type EventListener<K extends keyof HTMLElementEventMap> = (
  this: HTMLElement,
  event: HTMLElementEventMap[K]
) => any;

type ReplaceEventListeners<T> = {
  [K in keyof T]?: K extends string
    ? Lowercase<K> extends `on${infer E}`
      ? E extends keyof HTMLElementEventMap
        ? EventListener<E>
        : T[K]
      : T[K]
    : T[K];
};

export type IntrinsicHTMLElementsAttributes = {
  [K in keyof React.JSX.IntrinsicElements]: React.JSX.IntrinsicElements[K] extends React.DetailedHTMLProps<
    infer T,
    infer _
  >
    ? ReplaceEventListeners<Omit<T, "children">>
    : never;
};
