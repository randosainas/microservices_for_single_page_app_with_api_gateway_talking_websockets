export class trTest extends HTMLElement {
  static observedAttributes = ["value", "minval", "maxval"];
  static template = (): string => {
    const html = String.raw;
    return html`
<div class="relative origin-center border-2 border-gray-700 mt-5 p-2 w-22">
  <div id="disp" class="text-center badge-soft mb-1">---</div>
  <div>
    <button id="up" class="btn btn-sm btn-accent text-accent-content">+</button>
    <button id="down" class="btn btn-sm btn-accent text-accent-content">-</button>
  </div>
</div>`};

  private _value: number = 0;
  private _minval: number | null = null;
  private _maxval: number | null = null;
  private dispElement: HTMLElement | null;

  constructor() {
    super();
    this.innerHTML = trTest.template();
    this.dispElement = this.querySelector("#disp");
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (this.minval && value < this.minval) return;
    if (this.maxval && value > this.maxval) return;
    this._value = value;
  }

  get minval() {
    return this._minval;
  }

  set minval(minval) {
    this._minval = minval;
  }

  get maxval() {
    return this._maxval;
  }

  set maxval(maxval) {
    this._maxval = maxval;
  }

  incr() {
    this.value++;
    this.update();
  }

  decr() {
    this.value--;
    this.update();
  }

  connectedCallback() {
    this.querySelector("#up")?.addEventListener("click", () => {
      this.incr();
    })
    this.querySelector("#down")?.addEventListener("click", () => {
      this.decr();
    })
    this.update();
  }

  disconnectedCallback() {
  }

  adoptedCallback() {
  }

  attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
    switch (name) {
      case "value":
        this.value = newVal;
        break;
      case "minval":
        this.minval = newVal;
        break;
      case "maxval":
        this.maxval = newVal;
        break;
      default:
        break;
    }
  }

  update() {
    if (this.dispElement) {
      this.dispElement.textContent = `${this.value}`;
    }
  }
}

customElements.define("tr-test", trTest);
