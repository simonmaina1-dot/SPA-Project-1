import { Component } from 'react';

// Check if we're in development mode
const isDevelopment = import.meta.env?.MODE === 'development';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo,
    });

    // Log to console for debugging
    if (isDevelopment) {
      console.group('🔴 Error Details');
      console.error('Error:', error.message);
      console.error('Component Stack:', errorInfo?.componentStack || 'Not available');
      console.groupEnd();
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '2rem',
            borderRadius: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{
              color: '#dc2626',
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '600',
            }}>
              ⚠️ Something went wrong
            </h2>
            
            <p style={{
              color: '#7f1d1d',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
            }}>
              We encountered an unexpected error. This has been logged and we're working to fix it.
            </p>

            {isDevelopment && this.state.error && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                color: '#334155',
                overflow: 'auto',
              }}>
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #dc2626',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#fef2f2';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
