import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function MFOPage() {
  const [mfos] = useState([
    { id: 1, title: "Personnel Services Management" },
    { id: 2, title: "Training and Development" },
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Major Final Outputs (MFO)</h1>
      <Button>Add MFO</Button>

      <Card>
        <CardContent className="p-6">
          <ul className="space-y-2">
            {mfos.map(mfo => (
              <li key={mfo.id} className="border p-3 rounded">
                {mfo.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}