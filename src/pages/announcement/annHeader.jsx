import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const AnnHeader = ({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  filter,
  setFilter,
}) => {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 bg-background">
      {/* Left side: Tabs */}
      <div className="flex gap-4">
        <Button
          size="sm"
          onClick={() => setFilter("All")}
          className={`px-4 py-2 rounded ${
            filter === "All"
              ? "bg-blue-100 text-blue-700 font-medium" // Light blue highlight
              : "bg-white text-gray-600 hover:bg-blue-200"
          }`}
        >
          All Department
        </Button>

        <Button
          size="sm"
          onClick={() => setFilter("Department")}
          className={`px-4 py-2 rounded ${
            filter === "Department"
              ? "bg-blue-100 text-blue-700 font-medium"
              : "bg-white text-gray-600 hover:bg-blue-200"
          }`}
        >
          Department
        </Button>
      </div>

      {/* Right side: Search & Date Filters */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Search announcements"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[280px] max-w-full"
          />
          <Button variant="outline" size="sm" className="text-muted-foreground">
            <Search size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-3 text-sm">
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
      </div>
    </div>
  );
};

export default AnnHeader;
