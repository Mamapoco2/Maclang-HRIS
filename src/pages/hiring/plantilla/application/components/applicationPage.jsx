import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FileText, MessageSquare } from "lucide-react";
import { IconLoader2 } from "@tabler/icons-react";
import { plantillaPostingService } from "@/services/plantillaPostingService";
import { getEcho } from "@/lib/echo";
import ApplicationsPage from "./overview/applicationsPage";
import DocumentsPage from "./documents/documentsPage";
import InterviewPage from "./interviews/interviewPage";

export default function ApplicationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    loadData();

    const echo = getEcho();
    channelRef.current = echo
      .channel("plantilla-application-interviews")
      .listen(".plantilla_application_interview.updated", (e) => {
        const updated = e.interview;
        setApplications((prev) =>
          prev.map((a) =>
            a.id === updated.plantilla_posting_application_id
              ? { ...a, interview: updated }
              : a,
          ),
        );
      });

    return () => {
      channelRef.current?.stopListening(
        ".plantilla_application_interview.updated",
      );
      echo.leave("plantilla-application-interviews");
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await plantillaPostingService.getAllApplications();
    setApplications(data);
    setLoading(false);
  };

  const updateApplication = (id, patch) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <IconLoader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

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
        <ApplicationsPage
          applications={applications}
          onUpdate={updateApplication}
        />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsPage applications={applications} />
      </TabsContent>

      <TabsContent value="interviews">
        <InterviewPage
          applications={applications}
          onUpdate={updateApplication}
        />
      </TabsContent>
    </Tabs>
  );
}
