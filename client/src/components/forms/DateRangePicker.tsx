import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

export default function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    const selectedDate = date || null;
    setStartDate(selectedDate);
    if (selectedDate && endDate && selectedDate > endDate) {
      setEndDate(null);
      onDateRangeChange(selectedDate, null);
    } else {
      onDateRangeChange(selectedDate, endDate);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    const selectedDate = date || null;
    setEndDate(selectedDate);
    if (startDate && selectedDate && selectedDate < startDate) {
      setStartDate(null);
      onDateRangeChange(null, selectedDate);
    } else {
      onDateRangeChange(startDate, selectedDate);
    }
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    onDateRangeChange(null, null);
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;
    } else if (startDate) {
      return `From ${format(startDate, "MMM dd, yyyy")}`;
    } else if (endDate) {
      return `Until ${format(endDate, "MMM dd, yyyy")}`;
    }
    return "Select date range";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !startDate && !endDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Calendar
              mode="single"
              selected={startDate || undefined}
              onSelect={handleStartDateSelect}
              initialFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Calendar
              mode="single"
              selected={endDate || undefined}
              onSelect={handleEndDateSelect}
              disabled={(date) => startDate ? date < startDate : false}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={clearDates} variant="outline">
              Clear
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}