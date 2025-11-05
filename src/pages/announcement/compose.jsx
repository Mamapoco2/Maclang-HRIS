import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CURRENT_USER = "IT Dept User";

const Compose = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else {
      document.body.style.overflow = "auto";
      clearForm();
    }
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  const clearForm = () => {
    setSubject("");
    setRecipient("");
    setFile(null);
    setErrors({});
    setLinkValue("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const execCmd = (command, value = null) => document.execCommand(command, false, value);

  const handleLinkInsert = () => {
    if (!linkValue) return;
    execCmd("createLink", linkValue);
    setShowLinkModal(false);
    setLinkValue("");
  };

  const validate = () => {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!recipient) newErrors.recipient = "Recipient is required";
    if (!editorRef.current.innerHTML.trim())
      newErrors.message = "Message cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;

    const messageData = {
      subject,
      message: editorRef.current.innerText,
      content: editorRef.current.innerHTML,
      recipient, // ✅ fixed: use recipient instead of department
      file,
      links: Array.from(editorRef.current.querySelectorAll("a")).map((a) => a.href),
      sender: CURRENT_USER,
      time: new Date().toISOString(),
    };

    // Save to localStorage
    const sent = JSON.parse(localStorage.getItem("sentMessages") || "[]");
    localStorage.setItem(
      "sentMessages",
      JSON.stringify([{ ...messageData, id: Date.now() }, ...sent])
    );

    toast.success("Message sent!");
    window.dispatchEvent(new Event("storage"));
    clearForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[95%] max-w-4xl max-h-[95vh] overflow-y-auto border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-200 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Compose Message</h2>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <Label className="mb-1">Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
            className={errors.subject ? "border-red-500" : ""}
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
        </div>

        {/* Recipient */}
        <div className="mb-4">
          <Label className="mb-1">Recipient</Label>
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger
              className={`w-full ${errors.recipient ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent className="w-full max-h-60 overflow-auto">
              <SelectItem value="All Departments">All Departments</SelectItem>
              <SelectItem value="HR Department">HR Department</SelectItem>
              <SelectItem value="IT Department">IT Department</SelectItem>
              <SelectItem value="Nursing Service Office">Nursing Service Office</SelectItem>
            </SelectContent>
          </Select>
          {errors.recipient && (
            <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
          )}
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
          <Button variant="outline" size="icon" onClick={() => setShowLinkModal(true)}>
            <LinkIcon size={18} />
          </Button>
        </div>

        {/* Editor */}
        <div
          className={`border rounded-lg p-3 mb-4 min-h-[200px] overflow-y-auto bg-gray-50 ${
            errors.message ? "border-red-500" : ""
          }`}
          contentEditable
          ref={editorRef}
        ></div>
        {errors.message && (
          <p className="text-red-500 text-sm mb-3">{errors.message}</p>
        )}

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

        {/* Link Modal */}
        {showLinkModal && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-[300px] z-50">
            <Label>Insert Link</Label>
            <Input
              placeholder="https://example.com"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              className="mb-3"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleLinkInsert}>
                Insert
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compose;
