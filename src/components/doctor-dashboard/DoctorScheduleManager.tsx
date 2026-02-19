import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, Ban, CalendarCheck, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM",
];

const SLOT_DURATION_OPTIONS = [15, 30, 45, 60];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function to24(time12: string): string {
  const [time, meridiem] = time12.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function to12(time24: string): string {
  let [h, m] = time24.slice(0, 5).split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${meridiem}`;
}

interface DaySchedule {
  slots: string[];
  isOff: boolean;
}

interface Props {
  doctorId: string;
}

export default function DoctorScheduleManager({ doctorId }: Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({});
  const [activeTab, setActiveTab] = useState<"schedule" | "overview">("schedule");

  // Panel state
  const [dayOff, setDayOff] = useState(false);
  const [slotDuration, setSlotDuration] = useState(30);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [breakStart, setBreakStart] = useState("01:00 PM");
  const [breakEnd, setBreakEnd] = useState("02:00 PM");
  const [saving, setSaving] = useState(false);

  // Fetch all slots for the visible month
  const fetchMonthSlots = useCallback(async () => {
    const startDate = formatDateKey(viewYear, viewMonth, 1);
    const endDate = formatDateKey(viewYear, viewMonth, getDaysInMonth(viewYear, viewMonth));

    const { data, error } = await supabase
      .from("doctor_availability")
      .select("*")
      .eq("doctor_id", doctorId)
      .gte("slot_date", startDate)
      .lte("slot_date", endDate)
      .order("start_time");

    if (error) {
      toast({ title: "Error loading schedule", description: error.message, variant: "destructive" });
      return;
    }

    const newSchedule: Record<string, DaySchedule> = {};
    (data || []).forEach((slot) => {
      const key = slot.slot_date;
      if (!newSchedule[key]) newSchedule[key] = { slots: [], isOff: false };
      newSchedule[key].slots.push(to12(slot.start_time));
    });
    setSchedule(newSchedule);
  }, [doctorId, viewMonth, viewYear]);

  useEffect(() => {
    fetchMonthSlots();
  }, [fetchMonthSlots]);

  function handleSelectDate(day: number) {
    const key = formatDateKey(viewYear, viewMonth, day);
    setSelectedDate(key);
    const existing = schedule[key];
    if (existing) {
      setDayOff(existing.isOff || false);
      setSelectedSlots(existing.slots || []);
    } else {
      setDayOff(false);
      setSelectedSlots([]);
    }
  }

  function toggleSlot(slot: string) {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }

  async function handleSave() {
    if (!selectedDate) return;
    setSaving(true);

    // Delete existing slots for this date
    const { error: delError } = await supabase
      .from("doctor_availability")
      .delete()
      .eq("doctor_id", doctorId)
      .eq("slot_date", selectedDate);

    if (delError) {
      toast({ title: "Error", description: delError.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Insert new slots (skip if day off)
    if (!dayOff && selectedSlots.length > 0) {
      const rows = selectedSlots.map((slot) => {
        const start24 = to24(slot);
        const [h, m] = start24.split(":").map(Number);
        const endMin = m + slotDuration;
        const endTime = `${String(h + Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
        return {
          doctor_id: doctorId,
          slot_date: selectedDate,
          start_time: start24,
          end_time: endTime,
        };
      });

      const { error: insError } = await supabase.from("doctor_availability").insert(rows);
      if (insError) {
        toast({ title: "Error saving slots", description: insError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    toast({ title: dayOff ? "Day marked as off" : `${selectedSlots.length} slots saved for ${parseDateKey(selectedDate)}` });
    setSaving(false);
    fetchMonthSlots();
  }

  async function handleClearDay() {
    if (!selectedDate) return;
    const { error } = await supabase
      .from("doctor_availability")
      .delete()
      .eq("doctor_id", doctorId)
      .eq("slot_date", selectedDate);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setSelectedSlots([]);
    setDayOff(false);
    toast({ title: `Cleared schedule for ${parseDateKey(selectedDate)}` });
    fetchMonthSlots();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function getDayStatus(day: number) {
    const key = formatDateKey(viewYear, viewMonth, day);
    const s = schedule[key];
    if (!s) return "empty";
    if (s.isOff) return "off";
    if (s.slots && s.slots.length > 0) return "scheduled";
    return "empty";
  }

  const scheduledDates = Object.entries(schedule).filter(([, v]) => !v.isOff && v.slots?.length > 0);
  const offDates = Object.entries(schedule).filter(([, v]) => v.isOff);

  function parseDateKey(key: string) {
    const [y, m, d] = key.split("-");
    return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  }

  const isBreakSlot = (slot: string) => {
    const bsIdx = TIME_SLOTS.indexOf(breakStart);
    const beIdx = TIME_SLOTS.indexOf(breakEnd);
    const slotIdx = TIME_SLOTS.indexOf(slot);
    return slotIdx >= bsIdx && slotIdx < beIdx;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
      {/* LEFT: Calendar */}
      <div className="flex flex-col gap-5">
        {/* Tabs */}
        <div className="flex rounded-lg border border-border bg-muted/30 p-1">
          {([["schedule", "Set Schedule"], ["overview", "Overview"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "schedule" | "overview")}
              className={`flex-1 rounded-md py-2 text-xs font-semibold tracking-wide transition-all ${
                activeTab === key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Calendar Card */}
        <div className="rounded-2xl border border-border bg-card p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-sm text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = formatDateKey(viewYear, viewMonth, day);
              const status = getDayStatus(day);
              const isSelected = selectedDate === key;
              const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
              const isPast = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <button
                  key={day}
                  onClick={() => !isPast && handleSelectDate(day)}
                  disabled={isPast}
                  className={`relative h-9 w-full rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : status === "scheduled"
                        ? "bg-primary/15 text-foreground"
                        : status === "off"
                          ? "bg-destructive/10 text-foreground"
                          : "text-foreground hover:bg-muted"
                  } ${isToday && !isSelected ? "ring-1.5 ring-primary/50" : ""} ${isPast ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {day}
                  {status === "scheduled" && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                  {status === "off" && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 justify-center">
            {[
              { className: "bg-primary", label: "Available" },
              { className: "bg-destructive", label: "Day Off" },
              { className: "ring-2 ring-primary/50 bg-transparent", label: "Today" },
            ].map(({ className, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className={`w-2 h-2 rounded-full inline-block ${className}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-3">
            {[
              { icon: <CalendarCheck className="h-5 w-5 text-primary" />, label: "Scheduled Days", value: scheduledDates.length, color: "text-primary" },
              { icon: <Ban className="h-5 w-5 text-destructive" />, label: "Days Off", value: offDates.length, color: "text-destructive" },
              { icon: <Clock className="h-5 w-5 text-accent-foreground" />, label: "Total Slots", value: scheduledDates.reduce((acc, [, v]) => acc + (v.slots?.length || 0), 0), color: "text-accent-foreground" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                {icon}
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground">{label}</div>
                  <div className={`text-xl font-extrabold ${color}`}>{value}</div>
                </div>
              </div>
            ))}

            {scheduledDates.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-3">
                  Upcoming Schedules
                </div>
                {scheduledDates.slice(0, 4).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-xs text-foreground">{parseDateKey(key)}</span>
                    <Badge variant="secondary" className="text-xs">{val.slots?.length} slots</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Schedule Panel */}
      <div className="min-w-0">
        {!selectedDate ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 gap-3 text-center p-10">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div className="text-lg font-bold text-muted-foreground">Select a Date</div>
            <div className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
              Click any date on the calendar to set your availability and appointment slots.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
            {/* Date Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Editing Schedule For
                </div>
                <div className="text-xl font-extrabold text-foreground mt-0.5">
                  {parseDateKey(selectedDate)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleClearDay}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Schedule"}
                </Button>
              </div>
            </div>

            {/* Day Off Toggle */}
            <div className={`rounded-xl border p-4 flex items-center justify-between transition-colors ${
              dayOff ? "bg-destructive/5 border-destructive/30" : "bg-muted/30 border-border"
            }`}>
              <div>
                <div className={`font-bold text-sm ${dayOff ? "text-destructive" : "text-foreground"}`}>
                  {dayOff ? "🚫 Day Off" : "Mark as Day Off"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Patients won't see any availability on this day
                </div>
              </div>
              <Switch checked={dayOff} onCheckedChange={setDayOff} />
            </div>

            {!dayOff && (
              <>
                {/* Slot Duration */}
                <div>
                  <div className="text-xs text-muted-foreground font-bold tracking-wider uppercase mb-3">
                    Slot Duration
                  </div>
                  <div className="flex gap-2">
                    {SLOT_DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSlotDuration(d)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          slotDuration === d
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Break Time */}
                <div>
                  <div className="text-xs text-muted-foreground font-bold tracking-wider uppercase mb-3">
                    Break / Lunch Time
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 flex-wrap">
                    <span className="text-sm text-muted-foreground">☕ Break</span>
                    <Select value={breakStart} onValueChange={setBreakStart}>
                      <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">to</span>
                    <Select value={breakEnd} onValueChange={setBreakEnd}>
                      <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span className="text-[11px] text-muted-foreground ml-auto">Slots blocked automatically</span>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-muted-foreground font-bold tracking-wider uppercase">
                      Available Time Slots
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSlots(TIME_SLOTS.filter((s) => !isBreakSlot(s)))}
                        className="text-[11px] px-3 py-1 rounded-md bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedSlots([])}
                        className="text-[11px] px-3 py-1 rounded-md bg-muted text-muted-foreground font-semibold hover:text-foreground transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isBreak = isBreakSlot(slot);
                      const isSelected = selectedSlots.includes(slot);

                      return (
                        <button
                          key={slot}
                          disabled={isBreak}
                          onClick={() => !isBreak && toggleSlot(slot)}
                          className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                            isBreak
                              ? "bg-muted/20 text-muted-foreground/30 line-through cursor-not-allowed border border-transparent"
                              : isSelected
                                ? "bg-primary/20 text-primary border border-primary/40 shadow-sm"
                                : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground cursor-pointer"
                          }`}
                        >
                          {slot}
                          {isBreak && <div className="text-[9px] font-normal">break</div>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-lg bg-primary/5 p-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {selectedSlots.length} slots selected · Each {slotDuration} min
                    </span>
                    <span className="text-xs text-primary font-bold">
                      {selectedSlots.length * slotDuration} min total availability
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
