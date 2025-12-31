import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Pencil, 
  Eraser, 
  Undo, 
  Redo, 
  Trash2, 
  Download,
  Layers,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Layer {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  visible: boolean;
  opacity: number;
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onExport?: (dataUrl: string) => void;
  backgroundImage?: string;
}

type Tool = 'brush' | 'eraser';

export function DrawingCanvas({ 
  width = 800, 
  height = 600,
  onExport,
  backgroundImage,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize first layer
  useEffect(() => {
    const initialLayer = createLayer('Layer 1');
    setLayers([initialLayer]);
    setActiveLayerId(initialLayer.id);
  }, []);

  // Load background image if provided
  useEffect(() => {
    if (backgroundImage && layers.length > 0) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const bgLayer = layers[0];
        const ctx = bgLayer.canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          compositeAllLayers();
        }
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage, layers]);

  // Composite all layers whenever they change
  useEffect(() => {
    compositeAllLayers();
  }, [layers, activeLayerId]);

  const createLayer = (name: string): Layer => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      canvas,
      visible: true,
      opacity: 1,
    };
  };

  const compositeAllLayers = () => {
    const compositeCanvas = compositeCanvasRef.current;
    if (!compositeCanvas) return;

    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    // Clear composite canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all visible layers
    layers.forEach(layer => {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });

    ctx.globalAlpha = 1;
  };

  const getActiveLayer = (): Layer | undefined => {
    return layers.find(l => l.id === activeLayerId);
  };

  const saveToHistory = () => {
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    setIsDrawing(true);
    const rect = compositeCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    const rect = compositeCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.lineTo(x, y);
    ctx.stroke();

    compositeAllLayers();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const activeLayer = getActiveLayer();
      if (!activeLayer) return;

      const ctx = activeLayer.canvas.getContext('2d');
      if (!ctx) return;

      const prevImageData = history[historyStep - 1];
      ctx.putImageData(prevImageData, 0, 0);
      setHistoryStep(historyStep - 1);
      compositeAllLayers();
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const activeLayer = getActiveLayer();
      if (!activeLayer) return;

      const ctx = activeLayer.canvas.getContext('2d');
      if (!ctx) return;

      const nextImageData = history[historyStep + 1];
      ctx.putImageData(nextImageData, 0, 0);
      setHistoryStep(historyStep + 1);
      compositeAllLayers();
    }
  };

  const handleClear = () => {
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    saveToHistory();
    compositeAllLayers();
  };

  const handleExport = () => {
    const compositeCanvas = compositeCanvasRef.current;
    if (!compositeCanvas) return;

    const dataUrl = compositeCanvas.toDataURL('image/png');
    
    if (onExport) {
      onExport(dataUrl);
    } else {
      // Download directly
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const addLayer = () => {
    const newLayer = createLayer(`Layer ${layers.length + 1}`);
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length === 1) return; // Keep at least one layer
    
    const newLayers = layers.filter(l => l.id !== layerId);
    setLayers(newLayers);
    
    if (activeLayerId === layerId) {
      setActiveLayerId(newLayers[0].id);
    }
  };

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  ];

  return (
    <div className="flex gap-4">
      {/* Main Canvas Area */}
      <div className="flex-1 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="flex gap-2">
            <Button
              variant={tool === 'brush' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTool('brush')}
              title="Brush"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTool('eraser')}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-8 w-px bg-white/20" />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              title="Clear Layer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-8 w-px bg-white/20" />

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Color:</Label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-2 border-white/20"
            />
            <div className="flex gap-1">
              {presetColors.map(presetColor => (
                <button
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-all",
                    color === presetColor ? "border-white scale-110" : "border-white/20"
                  )}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>

          <div className="h-8 w-px bg-white/20" />

          {/* Brush Size */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Label className="text-sm whitespace-nowrap">Size: {brushSize}px</Label>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={1}
              max={50}
              step={1}
              className="flex-1"
            />
          </div>

          <div className="flex-1" />

          <Button
            onClick={handleExport}
            variant="default"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Canvas */}
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
          <canvas
            ref={compositeCanvasRef}
            width={width}
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair"
            style={{ 
              width: '100%', 
              height: 'auto',
              maxWidth: width,
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Layers Panel */}
      <div className="w-64 space-y-4">
        <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <h3 className="font-semibold">Layers</h3>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={addLayer}
              title="Add Layer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {[...layers].reverse().map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "p-2 rounded border transition-all cursor-pointer",
                  activeLayerId === layer.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
                onClick={() => setActiveLayerId(layer.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{layer.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                    >
                      {layer.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                    {layers.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLayer(layer.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Layer thumbnail */}
                <div className="mt-2 border border-white/10 rounded overflow-hidden">
                  <canvas
                    ref={(el) => {
                      if (el && layer.canvas) {
                        const ctx = el.getContext('2d');
                        if (ctx) {
                          ctx.clearRect(0, 0, el.width, el.height);
                          ctx.drawImage(layer.canvas, 0, 0, el.width, el.height);
                        }
                      }
                    }}
                    width={200}
                    height={150}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
