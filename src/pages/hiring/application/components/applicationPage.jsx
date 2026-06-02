import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationsPage from "./overview/applicationsPage";
import DocumentsPage from "./documents/documentsPage";
import InterviewPage from "./interviews/interviewPage";
import { LayoutDashboard, FileText, MessageSquare } from "lucide-react";

export default function ApplicationPage() {
  return (
    <Tabs defaultValue="overview" className="w-full p-6">
      <TabsList>
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          Application Overview
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="interviews" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Interviews
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ApplicationsPage />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsPage />
      </TabsContent>

      <TabsContent value="interviews">
        <InterviewPage />
      </TabsContent>
    </Tabs>
  );
}
