import { createContext, useContext, useState, ReactNode } from "react";

interface NudgeContextType {
  activeNudge: "idle" | "hesitation" | null;
  setActiveNudge: (nudge: "idle" | "hesitation" | null) => void;
}

const NudgeContext = createContext<NudgeContextType | undefined>(undefined);

export const NudgeProvider = ({ children }: { children: ReactNode }) => {
  const [activeNudge, setActiveNudge] = useState<"idle" | "hesitation" | null>(null);

  return (
    <NudgeContext.Provider value={{ activeNudge, setActiveNudge }}>
      {children}
    </NudgeContext.Provider>
  );
};

export const useNudge = () => {
  const context = useContext(NudgeContext);
  if (!context) {
    throw new Error("useNudge must be used within a NudgeProvider");
  }
  return context;
};
