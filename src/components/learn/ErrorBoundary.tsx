import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Coderlive ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-app text-primary min-h-[300px]">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-primary mb-2">
            {this.props.fallbackTitle || 'Đã xảy ra sự cố khi tải nội dung bài học'}
          </h3>
          <p className="text-xs text-secondary max-w-md mb-4 leading-relaxed">
            {this.state.error?.message || 'Có lỗi không mong muốn đã xảy ra. Hãy thử làm mới hoặc chọn lại khóa học.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-accent text-white rounded-[var(--radius-sm)] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
