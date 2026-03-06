import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateMentorProfile } from "@/hooks/useMentorProfile";
import { X, Plus } from "lucide-react";

// --- 1. Experience Snapshot Dialog ---
export const MentorExperienceDialog = ({ currentText, children }: { currentText: string, children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(currentText || "");
  const { mutateAsync: updateProfile, isPending } = useUpdateMentorProfile();

  const handleSave = async () => {
    await updateProfile({ experienceSnapshot: text });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Experience Snapshot</DialogTitle></DialogHeader>
        <Textarea className="min-h-[150px] mt-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe your experience..." />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- 2. Expertise Areas Dialog ---
export const MentorExpertiseDialog = ({ currentAreas, children }: { currentAreas: string[], children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { mutateAsync: updateProfile, isPending } = useUpdateMentorProfile();

  // FIX: Reset the internal state every time the dialog opens!
  useEffect(() => {
    if (open) {
      setAreas(currentAreas || []);
      setInput("");
    }
  }, [open, currentAreas]);

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!areas.includes(input.trim())) setAreas([...areas, input.trim()]);
      setInput("");
    }
  };

  const handleSave = async () => {
    // FIX: If the user typed a word but forgot to press Enter, grab it anyway!
    let finalAreas = [...areas];
    if (input.trim() && !areas.includes(input.trim())) {
      finalAreas.push(input.trim());
    }

    await updateProfile({ expertiseAreas: finalAreas });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Expertise Areas</DialogTitle></DialogHeader>
        <div className="mt-4">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleAdd} 
            placeholder="Type an area and press Enter..." 
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {areas.map((area) => (
              <Badge key={area} className="flex items-center gap-1 px-3 py-1">
                {area} 
                <X className="w-3 h-3 cursor-pointer" onClick={() => setAreas(areas.filter(a => a !== area))} />
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- 3. Capacity & Comms Dialog ---
export const MentorSettingsDialog = ({ profileData, children }: { profileData: any, children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [capacity, setCapacity] = useState(profileData?.mentoringCapacity || "1-2");
  const [modes, setModes] = useState<string[]>(profileData?.communicationModes || []);
  const { mutateAsync: updateProfile, isPending } = useUpdateMentorProfile();

  const toggleMode = (mode: string) => {
    setModes(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  const handleSave = async () => {
    await updateProfile({ mentoringCapacity: capacity, communicationModes: modes });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Mentoring Settings</DialogTitle></DialogHeader>
        <div className="space-y-6 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Mentoring Capacity (Mentees)</label>
            <Select value={capacity} onValueChange={setCapacity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2</SelectItem>
                <SelectItem value="3-5">3-5</SelectItem>
                <SelectItem value="6-10">6-10</SelectItem>
                <SelectItem value="10+">10+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Communication Modes</label>
            <div className="flex flex-wrap gap-2">
              {["In-Person Meetings", "Virtual Meetings"].map((mode) => (
                <Badge 
                  key={mode} 
                  variant={modes.includes(mode) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => toggleMode(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};