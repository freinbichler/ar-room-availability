export default class ARJSConfig {
  constructor() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    window.setTimeout(this.configure.bind(this), 2000);
  }

  configure() {
    window.dispatchEvent(new Event('resize'));
    document.querySelector('.a-enter-vr').style.display = 'none';
    document.querySelector('a-scene').onclick = () => {
      window.dispatchEvent(new Event('resize'));
    };
    window.addEventListener('resize', () => {
      this.setResizeTimeout(this.windowWidth, this.windowHeight);
    });
  }

  setResizeTimeout(oldWidth, oldHeight) {
    if (oldWidth === window.innerWidth && oldHeight === window.innerHeight) return;
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 700);
  }
}
