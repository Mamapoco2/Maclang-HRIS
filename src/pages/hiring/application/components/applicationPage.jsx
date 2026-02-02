import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./overview/applicationsPage";
import DocumentsPage from "./documents/documentsPage";
import InterviewPage from "./interviews/interviewPage";

export default function ManPowerPage() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList variant="line">
        <TabsTrigger value="overview">Application Overview</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="interviews">Interviews</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab />
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
