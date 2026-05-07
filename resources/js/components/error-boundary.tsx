import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
        
        // Log page info to help debugging
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const pageProps = (window as any).__INERTIA__?.page?.props;
            console.error('[ErrorBoundary] Context:', {
                path: currentPath,
                pageProps: pageProps,
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', margin: '20px', border: '2px solid red', borderRadius: '8px', backgroundColor: '#fee' }}>
                    <h1 style={{ color: 'red', margin: '0 0 10px 0' }}>Oops! Une erreur s\'est produite</h1>
                    <p style={{ marginBottom: '10px' }}>L'application a rencontré une erreur inattendue. Consultez la console du navigateur pour plus de détails.</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', backgroundColor: '#fafafa', padding: '10px', borderRadius: '4px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>Détails de l'erreur</summary>
                        <code style={{ fontSize: '12px', color: '#333' }}>
                            {this.state.error?.toString()}
                            <br />
                            <br />
                            {this.state.error?.stack}
                        </code>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Recharger la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
