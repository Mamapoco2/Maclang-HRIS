import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export default function TrainingForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
  });

  const handleSubmit = () => {
    if (!form.title) return;

    onSubmit({
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      category: form.category,
      duration: Number(form.duration) || 0,
      status: "published",
      progress: 0,
      participants: [],
    });

    setForm({ title: "", description: "", category: "", duration: "" });
  };

  return (
    <div className="space-y-3 max-w-md">
      <Input
        placeholder="Training Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Duration (mins)"
        value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
      />
      <Button onClick={handleSubmit}>Add Training</Button>
    </div>
  );
}
