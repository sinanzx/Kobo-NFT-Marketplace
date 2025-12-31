import * as React from 'react';
import { X, AlertTriangle, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { useState } from 'react';
import { captureError } from '@/lib/sentry';

interface ErrorOverlayProps {
  error: {
    message: string;
    stack?: string;
    file?: string;
    line?: number;
    column?: number;
  };
  onClose: () => void;
}

export function ErrorOverlay({ error, onClose }: ErrorOverlayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReport = () => {
    const errorObj = new Error(error.message);
    if (error.stack) {
      errorObj.stack = error.stack;
    }
    captureError(errorObj, {
      file: error.file,
      line: error.line,
      column: error.column,
      userReported: true,
      component: 'ErrorOverlay',
    });
    setReported(true);
    setTimeout(() => setReported(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 z-50 max-w-md mx-auto my-20 rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReport}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              title="Report this error"
              disabled={reported}
            >
              <Bug className={`h-4 w-4 ${reported ? 'text-green-500' : ''}`} />
              <span className="sr-only">Report error</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            The app encountered an issue while updating.
          </p>
          {reported && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Error reported to our team. Thank you!
            </p>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showDetails ? 'Hide' : 'Show'} technical details
          </button>

          {showDetails && (
            <div className="space-y-3 pt-2 border-t">
              {error.file && (
                <div className="text-sm">
                  <span className="font-medium">File:</span> {error.file}
                  {error.line && (
                    <span className="text-muted-foreground">
                      :{error.line}
                      {error.column && `:${error.column}`}
                    </span>
                  )}
                </div>
              )}

              <div>
                <h3 className="mb-2 font-medium text-sm">Error Message:</h3>
                <div className="rounded-md bg-muted p-3 font-mono text-xs">
                  {error.message}
                </div>
              </div>

              {error.stack && (
                <div>
                  <h3 className="mb-2 font-medium text-sm">Stack Trace:</h3>
                  <div className="max-h-32 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
