import React, { useState, useRef, useEffect } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Compose = ({ isOpen, onClose, onSend }) => {
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const editorRef = useRef(null);

  // Prevent background scroll and clear fields when modal closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      clearForm();
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const clearForm = () => {
    setSubject("");
    setDepartment("");
    setLink("");
    setFile(null);
    setErrors({});
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const execCmd = (command) => document.execCommand(command, false, null);

  const validate = () => {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!department) newErrors.department = "Department is required";
    if (!editorRef.current.innerHTML.trim()) newErrors.message = "Message cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;

    onSend({
      subject,
      department,
      message: editorRef.current.innerHTML,
      link,
      file,
    });

    clearForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[95%] max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-100 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-200 rounded-full transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Announcement</h2>
          <p className="text-sm text-gray-500 mt-1">Fill out the details below to send an announcement</p>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <Label className="mb-1">Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className={errors.subject ? "border-red-500" : ""}
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
        </div>

        {/* Department */}
        <div className="mb-4">
          <Label className="mb-1">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className={`w-full ${errors.department ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent className="w-full max-h-60 overflow-auto">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="IT Dept">IT Dept</SelectItem>
              <SelectItem value="Nursing">Nursing</SelectItem>
            </SelectContent>
          </Select>
          {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
        </div>

        {/* Toolbar */}
        <div className="flex gap-2 mb-4 border-b pb-2">
          <Button variant="outline" size="icon" onClick={() => execCmd("bold")}>
            <Bold size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd("italic")}>
            <Italic size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd("underline")}>
            <Underline size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd("justifyLeft")}>
            <AlignLeft size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd("justifyCenter")}>
            <AlignCenter size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => execCmd("justifyRight")}>
            <AlignRight size={18} />
          </Button>
        </div>

        {/* Editor */}
        <div
          className={`border rounded-lg p-3 mb-4 min-h-[200px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 scroll-smooth ${errors.message ? "border-red-500" : ""}`}
          contentEditable
          ref={editorRef}
        ></div>
        {errors.message && <p className="text-red-500 text-sm mb-3">{errors.message}</p>}

        {/* Optional Link */}
        <div className="mb-4">
          <Label className="mb-1">Link (optional)</Label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Insert link"
          />
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <Label className="mb-1">Upload File</Label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <span className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition">
              {file ? file.name : "Choose File"}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default Compose;
