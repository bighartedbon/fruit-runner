/**
 * input.js
 * Centralizes keyboard input so game systems can query state without
 * directly wiring DOM events in every file.
 */
export class Input {
  constructor() {
    this.keys = new Set();

    window.addEventListener('keydown', (event) => {
      if (this.isGameKey(event.code)) {
        event.preventDefault();
        this.keys.add(event.code);
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });

    window.addEventListener('blur', () => this.keys.clear());
  }

  isGameKey(code) {
    return [
      'ArrowLeft', 'ArrowRight', 'ArrowUp',
      'KeyA', 'KeyD', 'KeyW', 'Space'
    ].includes(code);
  }
}
