import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Compose from "./compose"; 

const AnnHeader = ({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const handleOpenCompose = () => setIsComposeOpen(true);
  const handleCloseCompose = () => setIsComposeOpen(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between border-b px-4 py-3 bg-background gap-4">
        {/* Left: Create Announcement */}
        <Button
          onClick={handleOpenCompose}
          variant="default" // shadcn default (black)
          className="shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Create Announcement
        </Button>

        {/* Right: Filters + Search */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Filters */}
          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-foreground">From:</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-32"
            />
            <label className="text-muted-foreground">To:</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-32"
            />
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[240px]"
            />
            <Button variant="outline" size="sm" className="text-muted-foreground">
              <Search size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <Compose isOpen={isComposeOpen} onClose={handleCloseCompose} />
    </>
  );
};

export default AnnHeader;
