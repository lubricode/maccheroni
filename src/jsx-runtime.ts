import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  scan,
  shareReplay,
  tap,
} from "rxjs";
import { HTMLStoreOutletElement } from "./custom-elements";
import { MaybeArray, unique } from "./lib/array";
import { IntrinsicHTMLElementsAttributes } from "./types/dom";

const createAnchorComment = () => document.createComment("anchor");

export class AnchorDocumentFragment extends DocumentFragment {
  value$: Observable<Node>;

  #anchorNode = createAnchorComment();
  #mutationObserver?: MutationObserver;

  constructor(...elements: JSX.Element[]) {
    super();

    this.append(this.#anchorNode, ...elements);

    this.value$ = new Observable<Node>((observer) => {
      (this.#mutationObserver = new MutationObserver((records) => {
        const removedNodes = records.flatMap((record) => [
          ...record.removedNodes,
        ]);

        const parentNode = unique(
          removedNodes.flatMap((node) => node.parentNode ?? [])
        );

        if (this.childNodes.length === 0 && parentNode != null) {
          observer.next(this.#anchorNode);

          this.append((this.#anchorNode = createAnchorComment()));
        }
      })).observe(this, { childList: true });
    }).pipe(
      distinctUntilChanged(),
      tap({
        unsubscribe: () => this.#mutationObserver?.disconnect(),
      }),
      shareReplay({ refCount: true })
    );
  }
}

export class ObservableDocumentFragment extends AnchorDocumentFragment {
  constructor(elements$: Observable<JSX.Element>) {
    super();

    const outlet = new HTMLStoreOutletElement();

    combineLatest([
      this.value$,
      elements$.pipe(
        debounceTime(0),
        map(toChildNodes),
        map((childNodes) => (outlet.replaceChildren(...childNodes), [outlet]))
      ),
    ])
      .pipe(
        scan((previousNodes, [anchor, nodes]) => {
          for (const node of previousNodes) {
            node.parentNode?.removeChild(node);
          }

          anchor.parentNode?.insertBefore(toDocumentFragment(nodes), anchor);

          return nodes;
        }, new Array<Node>())
      )
      .subscribe();
  }
}

declare global {
  namespace JSX {
    type Element = ObservableDocumentFragment | Node | string;

    type StandardHTMLElements = {
      [K in keyof IntrinsicHTMLElementsAttributes]: Props<
        IntrinsicHTMLElementsAttributes[K]
      >;
    };

    type CustomHTMLElements = Record<"store-outlet", Props>;

    type IntrinsicElements = StandardHTMLElements & CustomHTMLElements;

    type Children = MaybeArray<Element>;

    type Props<T = Record<string, unknown>> = T & {
      children?: Children;
    };

    interface FunctionComponent<T = Record<string, unknown>> {
      (props: Props<T>): Element;
    }
  }
}

export const withChildren = <T extends DocumentFragment | HTMLElement>(
  node: T,
  children: JSX.Children
): T => (node.append(...[children].flat()), node);

export const toDocumentFragment = (children: JSX.Children) =>
  withChildren(new DocumentFragment(), children);

export const toChildNodes = (children: JSX.Children) => [
  ...toDocumentFragment(children).childNodes,
];

export const jsx = {
  createElement(
    component: JSX.FunctionComponent | string,
    propsWithChildren: JSX.Props | null,
    ...next: MaybeArray<JSX.Element[]>
  ): JSX.Element {
    const { children = [next].flat(2), ...props } = propsWithChildren ?? {};

    switch (typeof component) {
      case "function":
        return component({ ...props, children: toChildNodes(children) });
      case "string": {
        const CustomElement = customElements.get(component);

        const element =
          CustomElement != null
            ? new CustomElement()
            : document.createElement(component);

        for (const name in props) {
          const value = props[name];

          const EVENT_HANDLER_PREFIX = "on";

          if (name.startsWith(EVENT_HANDLER_PREFIX)) {
            if (typeof value === "function") {
              element.addEventListener(
                name
                  .replace(new RegExp(`^${EVENT_HANDLER_PREFIX}`), "")
                  .toLowerCase(),
                (event) => value(event)
              );
            }
          } else {
            element.setAttribute(name, String(value));
          }
        }

        return withChildren(element, children);
      }
    }
  },

  createFragment({ children }: { children: JSX.Element[] }): JSX.Element {
    return toDocumentFragment(children);
  },
};
