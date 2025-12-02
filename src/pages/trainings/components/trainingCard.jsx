import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TrainingCard({ training, onSelect }) {
  return (
    <Card
      onClick={() => onSelect(training)}
      className="shadow-md rounded-2xl cursor-pointer hover:scale-[1.01] transition"
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{training.title}</h3>
          <Badge>{training.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{training.description}</p>
        <p className="text-xs">Duration: {training.duration} mins</p>
        <p className="text-xs">
          Participants: {training.participants?.length || 0}
        </p>
      </CardContent>
    </Card>
  );
}
