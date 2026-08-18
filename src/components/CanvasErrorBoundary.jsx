import { Component } from 'react';

// Catches errors thrown inside the 3D <Canvas> tree (e.g. a failed asset
// fetch) so the whole page doesn't go blank. The rest of the UI (text,
// buttons) still renders normally on top.
export default class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('3D scene crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render nothing (transparent) instead of crashing the page.
      // The bg-[#030303] on the parent div still shows through.
      return null;
    }
    return this.props.children;
  }
}
