// SentBox.jsx
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Inbox as InboxIcon, 
  Send, 
  Star, 
  Trash2, 
  CornerUpRight, 
  Plus 
} from "lucide-react";
import Compose from "./compose";

const Sentbox = () => {
  const user = { name: "John Doe", department: "IT Dept" };
  const detailRef = useRef(null);

  const [emails, setEmails] = useState([
    { id: 1, sender: "John Doe", subject: "Project Update", snippet: "Here’s the latest update.", time: new Date(), content: "Full content of the announcement.", target: "All", pinned: false },
    { id: 2, sender: "John Doe", subject: "Holiday Schedule", snippet: "Next week is a holiday.", time: new Date(new Date().setDate(new Date().getDate() - 1)), content: "The office will be closed on Monday.", target: "HR", pinned: false },
    { id: 3, sender: "AdminUser", subject: "System Maintenance", snippet: "Scheduled maintenance this weekend.", time: new Date(new Date().setDate(new Date().getDate() - 2)), content: "System down 10PM–2AM Saturday.", target: "IT Dept", pinned: false },
  ]);

  const [activeTab, setActiveTab] = useState("Sent");
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Filter emails based on tab and search/date
  const filteredEmails = emails
    .filter(email => {
      if (activeTab === "Sent") return email.sender === user.name;
      if (activeTab === "Inbox") return email.sender !== user.name;
      if (activeTab === "Pinned") return email.pinned;
      return true;
    })
    .filter(email => 
      email.subject.toLowerCase().includes(search.toLowerCase()) ||
      email.target.toLowerCase().includes(search.toLowerCase())
    )
    .filter(email => {
      if (fromDate && new Date(email.time) < new Date(fromDate)) return false;
      if (toDate && new Date(email.time) > new Date(toDate)) return false;
      return true;
    });

  const handleSelectEmail = (email) => setSelectedEmail(email);

  const togglePin = (emailId) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, pinned: !e.pinned } : e));
    if (selectedEmail?.id === emailId) setSelectedEmail(prev => ({ ...prev, pinned: !prev.pinned }));
  };

  const handleDelete = (emailId) => {
    setEmails(prev => prev.filter(e => e.id !== emailId));
    if (selectedEmail?.id === emailId) setSelectedEmail(null);
  };

  const handleForward = (email) => alert(`Forwarding: ${email.subject}`);
  const handleCreateAnnouncement = () => setIsCreateModalOpen(true);

  const handleSendAnnouncement = (newAnnouncement) => {
    setEmails(prev => [
      {
        id: prev.length + 1,
        sender: user.name,
        subject: newAnnouncement.subject,
        snippet: newAnnouncement.message.substring(0, 50),
        content: newAnnouncement.message,
        time: new Date(),
        target: newAnnouncement.department || "All",
        pinned: false,
      },
      ...prev
    ]);
  };

  const handlePrintDetails = () => {
    if (detailRef.current) {
      const printContents = detailRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-white relative">
      {/* Sidebar */}
      <div className="w-48 bg-white border-r p-3 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-center">Announcement</h2>
        <nav className="flex flex-col items-start gap-1">
          {/* <Button 
            variant={activeTab === "Inbox" ? "default" : "ghost"} 
            className="justify-start w-full flex items-center gap-2" 
            onClick={() => setActiveTab("Inbox")}
          >
            <InboxIcon size={18} /> Inbox
          </Button> */}
          <Button 
            variant={activeTab === "Sent" ? "default" : "ghost"} 
            className="justify-start w-full flex items-center gap-2" 
            onClick={() => setActiveTab("Sent")}
          >
            <Send size={18} /> Sent
          </Button>
          {/* <Button 
            variant={activeTab === "Pinned" ? "default" : "ghost"} 
            className="justify-start w-full flex items-center gap-2" 
            onClick={() => setActiveTab("Pinned")}
          >
            <Star size={18} /> Pinned
          </Button> */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Input 
              type="text" 
              placeholder={`Search ${activeTab.toLowerCase()} announcements`} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-60" 
            />
            <Button variant="outline" size="sm"><Search size={16} /></Button>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <label className="text-gray-600">From:</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-32" />
            <label className="text-gray-600">To:</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-32" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Email List */}
          <div className="w-1/3 border-r overflow-y-auto">
            {filteredEmails.length > 0 ? (
              filteredEmails.map(email => (
                <div 
                  key={email.id} 
                  onClick={() => handleSelectEmail(email)} 
                  className={`flex justify-between items-center py-2 px-3 cursor-pointer transition-colors border-b
                    ${selectedEmail?.id === email.id ? "bg-blue-100" : "bg-gray-50"}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-gray-800 text-sm font-medium">
                      {email.sender} {email.pinned && <Star size={14} className="text-yellow-400" />}
                    </span>
                    <span className="text-gray-600 text-sm truncate">{email.subject}</span>
                    <span className="text-gray-500 text-xs truncate max-w-[180px]">{email.snippet}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{email.time.toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-center p-4">
                No {activeTab.toLowerCase()} announcements found.
              </div>
            )}
          </div>

          {/* Detailed View */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50" ref={detailRef}>
            {selectedEmail ? (
              <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-semibold mb-1 text-gray-800">{selectedEmail.subject}</h1>
                    <p className="text-sm text-gray-500">
                      {selectedEmail.sender} • {selectedEmail.target ? (selectedEmail.target === "All" ? "All Departments" : selectedEmail.target) : "All Departments"} • {selectedEmail.time.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => togglePin(selectedEmail.id)}>
                      <Star size={20} className={selectedEmail.pinned ? "text-yellow-400" : "text-gray-400"} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleForward(selectedEmail)}>
                      <CornerUpRight size={20} className="text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedEmail.id)}>
                      <Trash2 size={20} className="text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handlePrintDetails}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7m-6 0v6m0 0H6m6 0h6v7H6v-7z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedEmail.content}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center space-y-4">
                <p>Select a {activeTab.toLowerCase()} announcement to view</p>
                <Button variant="outline" onClick={handleCreateAnnouncement}>Create Announcement</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Create Button */}
      <Button
        className="fixed bottom-10 right-8 bg-blue-600 text-white w-12 h-12 flex items-center justify-center shadow hover:bg-blue-700"
        onClick={handleCreateAnnouncement}
      >
        <Plus size={20} />
      </Button>

      <Compose isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSend={handleSendAnnouncement} />
    </div>
  );
};

export default Sentbox;
