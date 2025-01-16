export class ShadowRenderer {
  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: absolute;
      visibility: hidden;
      top: -99999px;
      left: 0;
      width: 100%;
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.2;
    `;
    document.body.appendChild(this.container);
  }

  measureRow(rowHTML) {
    this.container.innerHTML = rowHTML;
    const height = this.container.scrollHeight;
    this.container.innerHTML = ''; // Clear the container after measurement
    return height;
  }

  destroy() {
    document.body.removeChild(this.container);
  }
}
