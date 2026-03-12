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

interface ManualScrambleDialogProps {
  onApply: (scramble: string) => void;
  puzzleType: string;
}

export function ManualScrambleDialog({ onApply, puzzleType }: ManualScrambleDialogProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onApply(input.trim());
    setIsOpen(false);
    setInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xs"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>手动输入</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>手动输入打乱公式 ({puzzleType})</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-xs text-gray-400">
            请输入符合该魔方类型的标准打乱字符串。支持多行粘贴。
          </p>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴或输入公式..."
            className="min-h-[150px] bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="border-gray-600 hover:bg-gray-700 text-gray-300"
          >
            取消
          </Button>
          <Button 
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            应用并预览
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
