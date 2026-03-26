import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function IPCRRate() {
  const [ratings, setRatings] = useState({ q: 0, e: 0, t: 0 })

  const average =
    (Number(ratings.q) +
      Number(ratings.e) +
      Number(ratings.t)) /
    3 || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rate IPCR</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Quality"
              type="number"
              onChange={e =>
                setRatings({ ...ratings, q: e.target.value })
              }
            />
            <Input
              placeholder="Efficiency"
              type="number"
              onChange={e =>
                setRatings({ ...ratings, e: e.target.value })
              }
            />
            <Input
              placeholder="Timeliness"
              type="number"
              onChange={e =>
                setRatings({ ...ratings, t: e.target.value })
              }
            />
          </div>

          <div className="text-lg font-semibold">
            Average Rating: {average.toFixed(2)}
          </div>

          <Button>Submit Rating</Button>
        </CardContent>
      </Card>
    </div>
  )
}