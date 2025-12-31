import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Contrast, 
  Sun, 
  Droplet,
  Palette,
  Stamp,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemixToolsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onApplyFilter: (filter: FilterType, value: number) => void;
  onApplyOverlay: (overlay: OverlayType) => void;
  onAddStamp: (stamp: StampType) => void;
}

export type FilterType = 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sepia' | 'grayscale';
export type OverlayType = 'gradient' | 'texture' | 'vignette' | 'light-leak';
export type StampType = 'star' | 'heart' | 'circle' | 'sparkle' | 'custom';

interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  grayscale: number;
}

export function RemixTools({ canvasRef, onApplyFilter, onApplyOverlay, onAddStamp }: RemixToolsProps) {
  const [filters, setFilters] = useState<FilterState>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
  });

  const handleFilterChange = (filter: FilterType, value: number) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
    onApplyFilter(filter, value);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
    };
    setFilters(defaultFilters);
    
    // Apply all default filters
    Object.entries(defaultFilters).forEach(([filter, value]) => {
      onApplyFilter(filter as FilterType, value);
    });
  };

  const overlays: Array<{ type: OverlayType; name: string; icon: any }> = [
    { type: 'gradient', name: 'Gradient', icon: Palette },
    { type: 'texture', name: 'Texture', icon: ImageIcon },
    { type: 'vignette', name: 'Vignette', icon: Sun },
    { type: 'light-leak', name: 'Light Leak', icon: Sparkles },
  ];

  const stamps: Array<{ type: StampType; name: string; emoji: string }> = [
    { type: 'star', name: 'Star', emoji: '⭐' },
    { type: 'heart', name: 'Heart', emoji: '❤️' },
    { type: 'circle', name: 'Circle', emoji: '⭕' },
    { type: 'sparkle', name: 'Sparkle', emoji: '✨' },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="stamps">Stamps</TabsTrigger>
        </TabsList>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-4 mt-4">
          <div className="space-y-4">
            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Brightness
                </Label>
                <span className="text-sm text-gray-400">{filters.brightness}%</span>
              </div>
              <Slider
                value={[filters.brightness]}
                onValueChange={(value) => handleFilterChange('brightness', value[0])}
                min={0}
                max={200}
                step={1}
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Contrast className="w-4 h-4" />
                  Contrast
                </Label>
                <span className="text-sm text-gray-400">{filters.contrast}%</span>
              </div>
              <Slider
                value={[filters.contrast]}
                onValueChange={(value) => handleFilterChange('contrast', value[0])}
                min={0}
                max={200}
                step={1}
              />
            </div>

            {/* Saturation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Saturation
                </Label>
                <span className="text-sm text-gray-400">{filters.saturation}%</span>
              </div>
              <Slider
                value={[filters.saturation]}
                onValueChange={(value) => handleFilterChange('saturation', value[0])}
                min={0}
                max={200}
                step={1}
              />
            </div>

            {/* Blur */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Blur</Label>
                <span className="text-sm text-gray-400">{filters.blur}px</span>
              </div>
              <Slider
                value={[filters.blur]}
                onValueChange={(value) => handleFilterChange('blur', value[0])}
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Sepia */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sepia</Label>
                <span className="text-sm text-gray-400">{filters.sepia}%</span>
              </div>
              <Slider
                value={[filters.sepia]}
                onValueChange={(value) => handleFilterChange('sepia', value[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {/* Grayscale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Grayscale</Label>
                <span className="text-sm text-gray-400">{filters.grayscale}%</span>
              </div>
              <Slider
                value={[filters.grayscale]}
                onValueChange={(value) => handleFilterChange('grayscale', value[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={resetFilters}
            >
              Reset All Filters
            </Button>
          </div>
        </TabsContent>

        {/* Overlays Tab */}
        <TabsContent value="overlays" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {overlays.map((overlay) => {
              const Icon = overlay.icon;
              return (
                <Button
                  key={overlay.type}
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => onApplyOverlay(overlay.type)}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{overlay.name}</span>
                </Button>
              );
            })}
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-gray-400">
              Click an overlay to apply it to your canvas. Overlays add atmospheric effects and textures.
            </p>
          </div>
        </TabsContent>

        {/* Stamps Tab */}
        <TabsContent value="stamps" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {stamps.map((stamp) => (
              <Button
                key={stamp.type}
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => onAddStamp(stamp.type)}
              >
                <span className="text-4xl">{stamp.emoji}</span>
                <span className="text-sm">{stamp.name}</span>
              </Button>
            ))}
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-gray-400 mb-2">
              Click a stamp to add it to your canvas. Click on the canvas to place it.
            </p>
            <p className="text-xs text-gray-500">
              Tip: You can resize and rotate stamps after placing them.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for applying effects
export const applyCanvasFilter = (
  canvas: HTMLCanvasElement,
  filters: Partial<FilterState>
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const filterString = [
    filters.brightness !== undefined ? `brightness(${filters.brightness}%)` : '',
    filters.contrast !== undefined ? `contrast(${filters.contrast}%)` : '',
    filters.saturation !== undefined ? `saturate(${filters.saturation}%)` : '',
    filters.blur !== undefined ? `blur(${filters.blur}px)` : '',
    filters.sepia !== undefined ? `sepia(${filters.sepia}%)` : '',
    filters.grayscale !== undefined ? `grayscale(${filters.grayscale}%)` : '',
  ].filter(Boolean).join(' ');

  ctx.filter = filterString;
};

export const applyCanvasOverlay = (
  canvas: HTMLCanvasElement,
  overlay: OverlayType
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  switch (overlay) {
    case 'gradient': {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    
    case 'vignette': {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    
    case 'texture': {
      // Simple noise texture
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 30 - 15;
        data[i] += noise;     // R
        data[i + 1] += noise; // G
        data[i + 2] += noise; // B
      }
      
      ctx.putImageData(imageData, 0, 0);
      break;
    }
    
    case 'light-leak': {
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }
};

export const addCanvasStamp = (
  canvas: HTMLCanvasElement,
  stamp: StampType,
  x: number,
  y: number,
  size: number = 50
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.translate(x, y);

  switch (stamp) {
    case 'star':
      drawStar(ctx, 0, 0, 5, size, size / 2);
      break;
    case 'heart':
      drawHeart(ctx, 0, 0, size);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    case 'sparkle':
      drawSparkle(ctx, 0, 0, size);
      break;
  }

  ctx.restore();
};

// Helper drawing functions
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const width = size;
  const height = size;

  ctx.save();
  ctx.beginPath();
  const topCurveHeight = height * 0.3;
  
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(
    x, y, 
    x - width / 2, y, 
    x - width / 2, y + topCurveHeight
  );
  ctx.bezierCurveTo(
    x - width / 2, y + (height + topCurveHeight) / 2, 
    x, y + (height + topCurveHeight) / 2, 
    x, y + height
  );
  ctx.bezierCurveTo(
    x, y + (height + topCurveHeight) / 2, 
    x + width / 2, y + (height + topCurveHeight) / 2, 
    x + width / 2, y + topCurveHeight
  );
  ctx.bezierCurveTo(
    x + width / 2, y, 
    x, y, 
    x, y + topCurveHeight
  );
  
  ctx.closePath();
  ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const rays = 4;
  const innerRadius = size * 0.2;
  const outerRadius = size * 0.5;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  
  for (let i = 0; i < rays * 2; i++) {
    const angle = (Math.PI * 2 * i) / (rays * 2);
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
