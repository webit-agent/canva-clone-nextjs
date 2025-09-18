import { protectServer } from "@/features/auth/utils";

import { Banner } from "./banner";
import { QuickActionsSection } from "./quick-actions-section";
import { DesignTipsSection } from "./design-tips-section";
import { ProjectStatsSection } from "./project-stats-section";
import { EnhancedProjectsSection } from "./enhanced-projects-section";
import { TemplatesSection } from "./templates-section";

export default async function Home() {
  await protectServer();

  return (
    <div className="flex flex-col space-y-8 max-w-screen-xl mx-auto pb-10">
      <Banner />
      <QuickActionsSection />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TemplatesSection />
          <EnhancedProjectsSection />
        </div>
        <div className="space-y-8">
          <DesignTipsSection />
          <ProjectStatsSection />
        </div>
      </div>
    </div>
  );
};

