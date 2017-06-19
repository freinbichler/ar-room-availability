export default class RotateDevice {
  constructor() {
    this.overlay = document.querySelector('.overlay-rotate-device');

    this.listen();
  }

  listen() {
    window.addEventListener('resize', () => {
      if (window.innerWidth > window.innerHeight) {
        this.overlay.style.display = 'none';
      } else {
        this.overlay.style.display = 'flex';
      }
    });
  }
}
