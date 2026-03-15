import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Keyboard } from "lucide-react";
import type { PuzzleType } from '../types/cube';

interface ManualScrambleDialogProps {
  onApply: (scramble: string) => void;
  puzzleType: PuzzleType;
}

export function ManualScrambleDialog({ onApply, puzzleType }: ManualScrambleDialogProps) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onApply(value);
    setOpen(false);
    setValue("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xs text-gray-300">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Manual Scramble</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Manual Scramble Entry ({puzzleType})</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-400 mb-3">
            Please enter a standard scramble string for this puzzle type. Multi-line paste is supported.
          </p>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste or enter scramble here..."
            className="min-h-[120px] bg-gray-900 border-gray-700 focus:ring-blue-500 text-white font-mono"
          />
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply & Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
