export class HTMLStoreOutletElement extends HTMLElement {
  #internals: ElementInternals;
  #shadowRoot: ShadowRoot;

  constructor(...childNodes: Node[]) {
    super();

    this.#internals = this.attachInternals();
    this.#shadowRoot = this.attachShadow({ mode: "open" });

    this.#shadowRoot.append(...childNodes);
  }

  replaceChildren(...nodes: (Node | string)[]): void {
    this.#shadowRoot.replaceChildren(...nodes);
  }

  get loading() {
    return this.#internals.states.has("loading");
  }

  set loading(newValue) {
    if (newValue) {
      this.#internals.states.add("loading");
    } else {
      this.#internals.states.delete("loading");
    }
  }
}
