import { Component, type ErrorInfo, type ReactNode } from 'react';

type PageErrorBoundaryProps = {
    page: string;
    children: ReactNode;
};

type PageErrorBoundaryState = {
    hasError: boolean;
    message: string | null;
};

export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
    state: PageErrorBoundaryState = {
        hasError: false,
        message: null,
    };

    static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
        return {
            hasError: true,
            message: error.message,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Page crash in ${this.props.page}`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                    <div className="w-full max-w-2xl rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
                        <h1 className="text-2xl font-semibold text-rose-700">Erreur de rendu</h1>
                        <p className="mt-3 text-sm text-slate-600">
                            La page <span className="font-medium">{this.props.page}</span> a rencontre une erreur.
                        </p>
                        {this.state.message ? (
                            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
                                {this.state.message}
                            </pre>
                        ) : null}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
