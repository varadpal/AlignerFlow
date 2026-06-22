import { Component } from 'react';
import './ErrorBoundary.css';

/**
 * Catches render errors anywhere below it so a single component crash shows a
 * recoverable fallback instead of unmounting the whole app to a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error boundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__inner">
            <h1 className="text-h2 error-boundary__title">Something went wrong</h1>
            <p className="text-body error-boundary__body">
              The screen ran into an unexpected error. Reloading should put it right.
            </p>
            <button className="btn btn--primary btn--lg" onClick={this.handleReload}>
              Reload AlignerFlow
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
