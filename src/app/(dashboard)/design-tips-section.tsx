"use client";

import { useState } from "react";
import { 
  Lightbulb, 
  Palette, 
  Type, 
  Layout, 
  ChevronRight
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DESIGN_TIPS = [
  {
    id: 1,
    title: "Use the Rule of Thirds",
    description: "Divide your design into thirds both horizontally and vertically for better composition",
    category: "Layout",
    icon: Layout,
    color: "bg-blue-500",
    isNew: false
  },
  {
    id: 2,
    title: "Limit Your Color Palette",
    description: "Stick to 2-3 main colors to create a cohesive and professional look",
    category: "Color",
    icon: Palette,
    color: "bg-pink-500",
    isNew: true
  },
  {
    id: 3,
    title: "Typography Hierarchy",
    description: "Use different font sizes and weights to guide the reader's eye through your content",
    category: "Typography",
    icon: Type,
    color: "bg-green-500",
    isNew: false
  }
];


export const DesignTipsSection = () => {
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % DESIGN_TIPS.length);
  };

  const currentTipData = DESIGN_TIPS[currentTip];
  const IconComponent = currentTipData.icon;

  return (
    <div className="space-y-6">
      {/* Design Tip of the Day */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Design Tip of the Day
              {currentTipData.isNew && (
                <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={nextTip}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 ${currentTipData.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">{currentTipData.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{currentTipData.description}</p>
              <Badge variant="outline" className="text-xs">
                {currentTipData.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
