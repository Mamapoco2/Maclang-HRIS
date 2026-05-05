import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationsPage from "./overview/applicationsPage";
import DocumentsPage from "./documents/documentsPage";
import InterviewPage from "./interviews/interviewPage";

export default function ApplicationPage() {
  return (
    <Tabs defaultValue="overview" className="w-full p-6">
      <TabsList>
        <TabsTrigger value="overview">Application Overview</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="interviews">Interviews</TabsTrigger>
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
