export const themeStore = {
  mode: 'system', 
  resolved: 'dark', 
  
  init() {
    const stored = localStorage.getItem('portfolio_theme') || 'system';
    this.mode = stored;
    
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.mode === 'system') this.updateResolved();
      });
    }
    
    this.updateResolved();
  },
  
  setMode(newMode) {
    this.mode = newMode;
    localStorage.setItem('portfolio_theme', newMode);
    this.updateResolved();
  },
  
  updateResolved() {
    if (this.mode === 'system') {
      this.resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      this.resolved = this.mode;
    }
    
    document.documentElement.setAttribute('data-theme', this.resolved);
    window.dispatchEvent(new CustomEvent('themeChange', { detail: this.resolved }));
  }
};