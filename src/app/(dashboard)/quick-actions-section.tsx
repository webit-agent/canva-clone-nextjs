"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Instagram, 
  FileText, 
  CreditCard, 
  Presentation,
  Image,
  Zap
} from "lucide-react";

import { useCreateProject } from "@/features/projects/api/use-create-project";
import { ProjectNameDialog } from "@/components/project-name-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PRESET_SIZES = [
  {
    name: "Instagram Post",
    description: "1080 × 1080 px",
    width: 1080,
    height: 1080,
    icon: Instagram,
    color: "bg-pink-500"
  },
  {
    name: "Business Card",
    description: "3.5 × 2 in",
    width: 1050,
    height: 600,
    icon: CreditCard,
    color: "bg-blue-500"
  },
  {
    name: "Flyer",
    description: "8.5 × 11 in",
    width: 2550,
    height: 3300,
    icon: FileText,
    color: "bg-green-500"
  },
  {
    name: "Presentation",
    description: "1920 × 1080 px",
    width: 1920,
    height: 1080,
    icon: Presentation,
    color: "bg-purple-500"
  },
  {
    name: "Social Media Story",
    description: "1080 × 1920 px",
    width: 1080,
    height: 1920,
    icon: Image,
    color: "bg-orange-500"
  },
  {
    name: "Custom Size",
    description: "Choose your dimensions",
    width: 900,
    height: 1200,
    icon: Plus,
    color: "bg-gray-500"
  }
];

export const QuickActionsSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof PRESET_SIZES[0] | null>(null);
  const router = useRouter();
  const mutation = useCreateProject();

  const handlePresetClick = (preset: typeof PRESET_SIZES[0]) => {
    setSelectedPreset(preset);
    setDialogOpen(true);
  };

  const handleCreateProject = (name: string) => {
    if (!selectedPreset) return;

    mutation.mutate(
      {
        name,
        json: "",
        width: selectedPreset.width,
        height: selectedPreset.height,
      },
      {
        onSuccess: ({ data }) => {
          setDialogOpen(false);
          router.push(`/editor/${data.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {PRESET_SIZES.map((preset) => {
          const IconComponent = preset.icon;
          return (
            <Card 
              key={preset.name}
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => handlePresetClick(preset)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${preset.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-sm mb-1">{preset.name}</h4>
                <p className="text-xs text-muted-foreground">{preset.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>


      <ProjectNameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleCreateProject}
        defaultName={selectedPreset?.name || "My Design"}
        title={`Create ${selectedPreset?.name || "Project"}`}
        description={`Create a new ${selectedPreset?.name.toLowerCase()} design`}
        isLoading={mutation.isPending}
      />
    </div>
  );
};
