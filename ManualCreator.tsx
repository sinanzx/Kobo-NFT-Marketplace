import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Upload, Palette, Loader2 } from 'lucide-react';
import { NFTType, GenerationMethod } from '@/utils/evmConfig';
import { GeneratedContent } from './AIGenerator';
import { DrawingCanvas } from './canvas/DrawingCanvas';
import { ImageUploader } from './canvas/ImageUploader';
import { RemixTools, FilterType, OverlayType, StampType, applyCanvasFilter, applyCanvasOverlay, addCanvasStamp } from './canvas/RemixTools';
import { supabase } from '@/lib/supabaseClient';

interface ManualCreatorProps {
  onUpload: (content: GeneratedContent, method: GenerationMethod) => void;
}

export function ManualCreator({ onUpload }: ManualCreatorProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'remix'>('draw');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhanceOptions, setEnhanceOptions] = useState({
    upscale: false,
    styleTransfer: '',
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File, preview: string) => {
    setUploadedImage(preview);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    const base64File = await base64Promise;

    // Upload to Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('upload-artwork', {
      body: {
        file: base64File,
        fileName: file.name,
        userId: user.id,
        enhance: enhanceOptions.upscale || !!enhanceOptions.styleTransfer,
        upscale: enhanceOptions.upscale,
        styleTransfer: enhanceOptions.styleTransfer,
      },
    });

    if (error) throw error;
    return data.url;
  };

  const handleDrawingExport = (dataUrl: string) => {
    const content: GeneratedContent = {
      url: dataUrl,
      prompt: 'Hand-drawn artwork',
      type: NFTType.IMAGE,
      model: 'manual-drawing',
    };
    onUpload(content, GenerationMethod.MANUAL_UPLOAD);
  };

  const handleUploadComplete = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    try {
      const content: GeneratedContent = {
        url: uploadedImage,
        prompt: 'Uploaded artwork',
        type: NFTType.IMAGE,
        model: 'manual-upload',
      };
      onUpload(content, GenerationMethod.MANUAL_UPLOAD);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyFilter = (filter: FilterType, value: number) => {
    if (!canvasRef.current) return;
    applyCanvasFilter(canvasRef.current, { [filter]: value });
  };

  const handleApplyOverlay = (overlay: OverlayType) => {
    if (!canvasRef.current) return;
    applyCanvasOverlay(canvasRef.current, overlay);
  };

  const handleAddStamp = (stamp: StampType) => {
    if (!canvasRef.current) return;
    // Add stamp at center of canvas
    const canvas = canvasRef.current;
    addCanvasStamp(canvas, stamp, canvas.width / 2, canvas.height / 2);
  };

  return (
    <Card className="p-5 border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-foreground/60" />
        <h2 className="text-sm font-medium">Manual Creator</h2>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-4 h-9">
          <TabsTrigger value="draw" className="text-xs">
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="remix" className="text-xs">
            <Palette className="w-3.5 h-3.5 mr-1.5" />
            Remix
          </TabsTrigger>
        </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <DrawingCanvas
              width={800}
              height={600}
              onExport={handleDrawingExport}
              backgroundImage={uploadedImage || undefined}
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <ImageUploader
              onImageSelect={handleImageSelect}
              onImageUpload={handleImageUpload}
              maxSizeMB={10}
            />

            {uploadedImage && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="font-semibold mb-3">AI Enhancement Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhanceOptions.upscale}
                        onChange={(e) => setEnhanceOptions(prev => ({ ...prev, upscale: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-upscale (2x resolution)</span>
                    </label>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Style Transfer</label>
                      <select
                        value={enhanceOptions.styleTransfer}
                        onChange={(e) => setEnhanceOptions(prev => ({ ...prev, styleTransfer: e.target.value }))}
                        className="w-full p-2 bg-white/5 border border-white/10 rounded"
                      >
                        <option value="">None</option>
                        <option value="anime">Anime</option>
                        <option value="oil-painting">Oil Painting</option>
                        <option value="watercolor">Watercolor</option>
                        <option value="sketch">Sketch</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleUploadComplete}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Use This Image'
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="remix" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                {uploadedImage ? (
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full border border-white/10 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
                    <p className="text-gray-400">Upload an image first to start remixing</p>
                  </div>
                )}
              </div>

              <div>
                <RemixTools
                  canvasRef={canvasRef}
                  onApplyFilter={handleApplyFilter}
                  onApplyOverlay={handleApplyOverlay}
                  onAddStamp={handleAddStamp}
                />
              </div>
            </div>

            {uploadedImage && (
              <Button
                onClick={() => {
                  if (canvasRef.current) {
                    const dataUrl = canvasRef.current.toDataURL('image/png');
                    handleDrawingExport(dataUrl);
                  }
                }}
                className="w-full"
              >
                Export Remixed Artwork
              </Button>
            )}
          </TabsContent>
        </Tabs>
    </Card>
  );
}
