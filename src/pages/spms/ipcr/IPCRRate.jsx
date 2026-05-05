import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingInputGroup, RatingSummary } from "@/components/RatingComponents";
import { useIPCRRating, getAdjectival } from "@/hooks/useIPCRRating";

export default function IPCRRate() {
  const [ratings, setRatings] = useState({ q: "", e: "", t: "" });

  const { average } = useIPCRRating(ratings.q, ratings.e, ratings.t);
  const adjectival = getAdjectival(average);

  const handleRatingChange = (field, value) => {
    setRatings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitting rating:", ratings);
    // TODO: API call
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rate IPCR</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <RatingInputGroup
            q={ratings.q}
            e={ratings.e}
            t={ratings.t}
            onQChange={(v) => handleRatingChange("q", v)}
            onEChange={(v) => handleRatingChange("e", v)}
            onTChange={(v) => handleRatingChange("t", v)}
          />

          <div className="space-y-3 pt-4 border-t">
            <div className="text-lg font-semibold">
              Average Rating: <span className="text-2xl">{average}</span>
            </div>

            {adjectival && (
              <div className="text-sm">
                Rating: <span className="font-semibold">{adjectival}</span>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Rating
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
