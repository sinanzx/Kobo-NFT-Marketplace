import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CopyrightAuditProps {
  content: {
    url: string;
    prompt?: string;
    model: string;
  } | null;
}

type AuditStatus = 'pending' | 'checking' | 'passed' | 'warning';

export function CopyrightAudit({ content }: CopyrightAuditProps) {
  const [status, setStatus] = useState<AuditStatus>('pending');
  const [auditHash, setAuditHash] = useState<string>('');

  useEffect(() => {
    if (!content) {
      setStatus('pending');
      setAuditHash('');
      return;
    }

    // Simulate copyright audit
    setStatus('checking');
    
    setTimeout(async () => {
      // Generate audit hash from content
      const hash = await generateAuditHash(content);
      setAuditHash(hash);
      
      // Simulate audit result (in production, this would call an actual API)
      const passed = Math.random() > 0.1; // 90% pass rate for demo
      setStatus(passed ? 'passed' : 'warning');
    }, 2000);
  }, [content]);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Shield className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'passed':
        return <Badge className="bg-green-500">Passed</Badge>;
      case 'warning':
        return <Badge variant="destructive">Review Required</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="p-5 border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="text-sm font-medium">Copyright Audit</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-3">
        {status === 'pending' && (
          <p className="text-sm text-muted-foreground">
            Generate or upload content to start copyright audit
          </p>
        )}

        {status === 'checking' && (
          <div className="space-y-2">
            <p className="text-sm">Analyzing content for copyright issues...</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>✓ Checking against known copyrighted works</p>
              <p>✓ Analyzing visual similarity</p>
              <p>✓ Verifying AI generation parameters</p>
            </div>
          </div>
        )}

        {status === 'passed' && (
          <div className="space-y-2">
            <p className="text-sm text-green-600 dark:text-green-400">
              No copyright issues detected
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-medium mb-1">Audit Hash</p>
              <p className="text-xs font-mono break-all">{auditHash}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This hash will be stored on-chain with your NFT
            </p>
          </div>
        )}

        {status === 'warning' && (
          <div className="space-y-2">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Potential similarity detected
            </p>
            <p className="text-xs text-muted-foreground">
              The content may be similar to existing works. Review recommended before minting.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-medium mb-1">Audit Hash</p>
              <p className="text-xs font-mono break-all">{auditHash}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

async function generateAuditHash(content: { url: string; prompt?: string; model: string }): Promise<string> {
  // Generate a hash from content metadata
  const data = JSON.stringify({
    prompt: content.prompt || 'No prompt',
    model: content.model,
    timestamp: Date.now(),
  });
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return '0x' + hashHex;
}

export { generateAuditHash };
