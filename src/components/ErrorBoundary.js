import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true, error };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can log the error and error information to an error reporting service
      console.error("Uncaught error:", error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <div>Error in component: {this.state.error.toString()}</div>;
      }
  
      return this.props.children; 
    }
  }

  export default ErrorBoundary;