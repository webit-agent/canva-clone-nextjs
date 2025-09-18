import { 
  ActiveTool, 
  Editor, 
  FONT_SIZE, 
  FONT_WEIGHT 
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { fontLoader, ensureFontLoaded, PROFESSIONAL_FONTS, FontDefinition } from "@/features/editor/utils/font-loader";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};


export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const value = editor?.getActiveFontFamily();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("popular");

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFontChange = async (fontName: string) => {
    setLoadingFonts(prev => new Set(prev).add(fontName));
    
    try {
      await ensureFontLoaded(fontName);
      editor?.changeFontFamily(fontName);
    } catch (error) {
      console.error(`Failed to load font ${fontName}:`, error);
      // Still try to apply the font with fallback
      editor?.changeFontFamily(fontName);
    } finally {
      setLoadingFonts(prev => {
        const newSet = new Set(prev);
        newSet.delete(fontName);
        return newSet;
      });
    }
  };

  const FontButton = ({ font }: { font: FontDefinition }) => {
    const isLoading = loadingFonts.has(font.name);
    const isSelected = value === font.name;
    
    return (
      <Button
        key={font.name}
        variant="ghost"
        disabled={isLoading}
        className={cn(
          "w-full h-16 justify-start text-left p-3 hover:bg-gray-50 transition-all duration-200",
          isSelected && "bg-blue-50 border-2 border-blue-500 shadow-sm",
          isLoading && "opacity-50"
        )}
        onClick={() => handleFontChange(font.name)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-2">
              <div
                className="font-medium text-base leading-tight"
                style={{ 
                  fontFamily: fontLoader.getFontFallback(font.name),
                  fontWeight: font.weights.includes(500) ? 500 : 400
                }}
              >
                {font.name}
              </div>
              {font.popular && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs capitalize",
                  font.category === 'serif' && "bg-amber-100 text-amber-800",
                  font.category === 'sans-serif' && "bg-blue-100 text-blue-800",
                  font.category === 'display' && "bg-purple-100 text-purple-800",
                  font.category === 'handwriting' && "bg-pink-100 text-pink-800",
                  font.category === 'monospace' && "bg-green-100 text-green-800",
                  font.category === 'system' && "bg-gray-100 text-gray-800"
                )}
              >
                {font.category.replace('-', ' ')}
              </Badge>
              {font.googleFont && (
                <Badge variant="outline" className="text-xs">
                  Google
                </Badge>
              )}
            </div>
          </div>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          )}
        </div>
      </Button>
    );
  };

  // Filter fonts based on search and category
  const getFilteredFonts = (category?: string) => {
    let fonts = PROFESSIONAL_FONTS;
    
    if (category === 'popular') {
      fonts = fontLoader.getPopularFonts();
    } else if (category && category !== 'all') {
      fonts = fontLoader.getFontsByCategory(category as FontDefinition['category']);
    }
    
    if (searchTerm) {
      fonts = fonts.filter(font => 
        font.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        font.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return fonts;
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "font" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Professional Fonts"
        description="Choose from curated font collection"
      />
      
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search fonts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="popular" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="sans-serif" className="text-xs">Sans Serif</TabsTrigger>
              <TabsTrigger value="serif" className="text-xs">Serif</TabsTrigger>
            </TabsList>
            
            <div className="mb-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="display" className="text-xs">Display</TabsTrigger>
                <TabsTrigger value="handwriting" className="text-xs">Script</TabsTrigger>
                <TabsTrigger value="monospace" className="text-xs">Mono</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Popular Fonts
                </h3>
                {getFilteredFonts('popular').map((font) => (
                  <FontButton key={font.name} font={font} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sans-serif" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sans Serif Fonts</h3>
                {getFilteredFonts('sans-serif').map((font) => (
                  <FontButton key={font.name} font={font} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="serif" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Serif Fonts</h3>
                {getFilteredFonts('serif').map((font) => (
                  <FontButton key={font.name} font={font} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Display Fonts</h3>
                {getFilteredFonts('display').map((font) => (
                  <FontButton key={font.name} font={font} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="handwriting" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Handwriting & Script</h3>
                {getFilteredFonts('handwriting').map((font) => (
                  <FontButton key={font.name} font={font} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monospace" className="space-y-2 mt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Monospace Fonts</h3>
                {getFilteredFonts('monospace').map((font) => (
                  <FontButton key={font.name} font={font} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
