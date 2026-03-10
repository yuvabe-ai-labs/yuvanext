import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateMentorProfile } from "@/hooks/useMentorProfile";
import { X, Plus, Trash2 } from "lucide-react";

// --- NEW 0. Name & Mentor Type Dialog ---
export const MentorBasicInfoDialog = ({ session, profileData, children }: { session: any, profileData: any, children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [mentorType, setMentorType] = useState(profileData?.mentorType || "general");
  const { mutateAsync: updateProfile, isPending } = useUpdateMentorProfile();

  useEffect(() => {
    if (open) {
      setName(session?.user?.name || "");
      setMentorType(profileData?.mentorType || "general");
    }
  }, [open, session, profileData]);

  const handleSave = async () => {
    // Note: If 'name' belongs to the 'users' table, you might need to call a separate hook 
    // to update the auth user. Here we're sending it via the same hook just in case your backend handles both.
    await updateProfile({ name, mentorType }); 
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Basic Information</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Mentor Specialization</label>
            <Select value={mentorType} onValueChange={setMentorType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="career_guidance">Career Guidance</SelectItem>
                <SelectItem value="internship_support">Internship Support</SelectItem>
                <SelectItem value="skills_portfolio">Skills & Portfolio</SelectItem>
                <SelectItem value="wellbeing_confidence">Wellbeing & Confidence</SelectItem>
                <SelectItem value="general">General Mentorship</SelectItem>
              </SelectContent>
            </Select>
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
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_MODES = ["In-Person Meeting", "Virtual Video Calls"]; 

export const MentorSettingsDialog = ({ profileData, children }: { profileData: any, children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  
  const [capacity, setCapacity] = useState(profileData?.mentoringCapacity || "1-2");
  const [modes, setModes] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [windows, setWindows] = useState<{start: string, end: string}[]>([]);

  const { mutateAsync: updateProfile, isPending } = useUpdateMentorProfile();

  useEffect(() => {
    if (open) {
      setCapacity(profileData?.mentoringCapacity || "1-2");
      // Fallback arrays to prevent undefines
      setModes(profileData?.communicationModes || []);
      setDays(profileData?.availabilityDays || []);
      
      // Parse windows correctly
      let initialWindows = [];
      const rawWindows = profileData?.availabilityTimeWindows;
      if (Array.isArray(rawWindows)) {
        initialWindows = rawWindows;
      } else if (typeof rawWindows === "string" && rawWindows.trim().startsWith("[")) {
        try { initialWindows = JSON.parse(rawWindows); } catch(e) {}
      }
      setWindows(initialWindows);
    }
  }, [open, profileData]);

  // Bug Fix: Strict exact-match toggling to avoid duplication
  const toggleMode = (mode: string) => {
    setModes((prev) => 
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const toggleDay = (day: string) => {
    setDays((prev) => 
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addTimeWindow = () => {
    setWindows([...windows, { start: "09:00", end: "17:00" }]);
  };

  const updateWindow = (index: number, field: "start" | "end", value: string) => {
    const newWindows = [...windows];
    newWindows[index][field] = value;
    setWindows(newWindows);
  };

  const removeWindow = (index: number) => {
    setWindows(windows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    await updateProfile({ 
      mentoringCapacity: capacity, 
      communicationModes: modes,
      availabilityDays: days,
      availabilityTimeWindows: windows
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Capacity & Availability Settings</DialogTitle></DialogHeader>
        
        <div className="space-y-6 mt-4 pb-4">
          
          {/* Capacity Section */}
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

          {/* Modes Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Communication Modes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_MODES.map((mode) => (
                <Badge 
                  key={mode} 
                  variant={modes.includes(mode) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 transition-colors"
                  onClick={() => toggleMode(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>

          {/* Days Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">Availability Days</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => (
                <Badge 
                  key={day} 
                  variant={days.includes(day) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1.5 ${days.includes(day) ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          {/* Times Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Time Windows</label>
              <Button type="button" variant="outline" size="sm" onClick={addTimeWindow} className="h-7 text-xs flex gap-1">
                <Plus className="w-3 h-3"/> Add Time
              </Button>
            </div>
            
            <div className="space-y-3">
              {windows.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No time windows set.</p>
              ) : (
                windows.map((win, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      type="time" 
                      value={win.start} 
                      onChange={(e) => updateWindow(idx, 'start', e.target.value)}
                      className="w-full"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <Input 
                      type="time" 
                      value={win.end} 
                      onChange={(e) => updateWindow(idx, 'end', e.target.value)}
                      className="w-full"
                    />
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0" onClick={() => removeWindow(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
        
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};