import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Check } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { NFTType } from '@/utils/evmConfig';
import { GeneratedContent } from './AIGenerator';

interface PreviewPanelProps {
  content: GeneratedContent | null;
  onRemake: () => void;
  onConfirm: () => void;
}

export function PreviewPanel({ content, onRemake, onConfirm }: PreviewPanelProps) {
  if (!content) {
    return (
      <Card className="p-5 flex items-center justify-center min-h-[300px] border-border/50">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No preview</p>
          <p className="text-xs mt-1">Generate or upload content</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">Preview</h2>
        <Badge variant="secondary" className="text-xs">
          {content.type === NFTType.IMAGE && 'Image'}
          {content.type === NFTType.VIDEO && 'Video'}
          {content.type === NFTType.AUDIO && 'Audio'}
        </Badge>
      </div>

      <div className="bg-muted/50 rounded-lg overflow-hidden mb-3">
        {content.type === NFTType.IMAGE && (
          <img
            src={content.url}
            alt={content.prompt || 'Generated NFT'}
            className="w-full h-auto"
          />
        )}
        {content.type === NFTType.VIDEO && (
          <video
            src={content.url}
            controls
            className="w-full h-auto"
            aria-label={content.prompt || 'Generated video NFT'}
          >
            <track kind="captions" />
          </video>
        )}
        {content.type === NFTType.AUDIO && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-full max-w-md">
              <audio src={content.url} controls className="w-full" aria-label={content.prompt || 'Generated audio NFT'} />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {content.prompt}
              </p>
            </div>
          </div>
        )}
      </div>

      {content.prompt && (
        <div className="mb-3 pb-3 border-b border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Prompt</p>
          <p className="text-xs">{content.prompt}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Tooltip content="Generate a new version with different parameters">
          <Button
            onClick={onRemake}
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Remake
          </Button>
        </Tooltip>
        <Tooltip content="Mint this content as an NFT on the blockchain">
          <Button
            onClick={onConfirm}
            size="sm"
            className="flex-1 h-8 text-xs"
          >
            <Check className="w-3 h-3 mr-1.5" />
            Mint
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
