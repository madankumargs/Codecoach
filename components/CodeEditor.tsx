// 📚 CODE EDITOR COMPONENT
// Monaco Editor = the same editor that powers VS Code!
// We import it dynamically because it's a BROWSER-ONLY library.
// "dynamic import" means: don't load this at build time, load it when the page renders.
// ssr: false means: don't try to run this on the server (it needs browser APIs)

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

// Lazy-load Monaco so it doesn't slow down initial page load
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading editor...</p>
      </div>
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  // Map our language keys to Monaco's language identifiers
  const monacoLanguageMap: Record<string, string> = {
    python: "python",
    javascript: "javascript",
    java: "java",
    cpp: "cpp",
    c: "c",
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height }}>
      <MonacoEditor
        height={height}
        language={monacoLanguageMap[language] || "python"}
        theme="vs-dark" // Dark theme matching our design
        value={value}
        onChange={(val) => onChange(val || "")}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,          // Nice → arrows in code
          minimap: { enabled: false },  // Hide the minimap (right side scroll preview)
          scrollBeyondLastLine: false,  // Don't show empty space after last line
          lineNumbers: "on",
          padding: { top: 16, bottom: 16 },
          readOnly,
          automaticLayout: true,        // Auto-resize when container changes size
          tabSize: 4,
          wordWrap: "on",
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />
    </div>
  );
}
