"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

type SetRepDiceProps = {
  setMin?: number;
  setMax?: number;
  setStep?: number;
  repValues?: (number)[]; 
};

const DEFAULT_REP_VALUES: (number)[] = [
  8,
  10,
  12,
  14,
  15,
  16,
  18,
  20,
];

function buildRange(min: number, max: number, step: number): number[] {
  const res: number[] = [];
  for (let v = min; v <= max; v += step) res.push(v);
  return res;
}

type DieProps = {
  label: string;
  value: number | string;
  rolling: boolean;
  onRoll: () => void;
};

const Die: React.FC<DieProps> = ({ label, value, rolling, onRoll }) => {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Roll ${label} die (current: ${value})`}
      onClick={onRoll}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRoll(); } }}
      style={{ cursor: "pointer" }}
      whileTap={{ scale: 0.9 }}
      animate={
        rolling
          ? {
              rotate: [0, 20, -20, 15, -15, 5, 0],
              scale: [1, 1.1, 0.98, 1.05, 1],
            }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          bgcolor: "rgba(255, 255, 255, 1)",
          border: "2px solid rgba(255,255,255,0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 30px rgba(88, 14, 14, 0.8)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textTransform: "uppercase",
            fontSize: 11,
            letterSpacing: 1,
            color: "rgba(226, 22, 22, 0.7)",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#252424ff",
          }}
        >
          {value}
        </Typography>
      </Box>
    </motion.div>
  );
};

const SetRepDice: React.FC<SetRepDiceProps> = ({
  // default sets: 2–8 in steps of 1
  setMin = 2,
  setMax = 8,
  setStep = 1,
  // default reps list, including "Till failure"
  repValues = DEFAULT_REP_VALUES,
}) => {
  const setOptions = React.useMemo(
    () => buildRange(setMin, setMax, setStep),
    [setMin, setMax, setStep]
  );

  const [setValue, setSetValue] = React.useState<number>(setOptions[0]);
  const [repValue, setRepValue] = React.useState<number | string>(repValues[0]);

  const [rollingSet, setRollingSet] = React.useState(false);
  const [rollingRep, setRollingRep] = React.useState(false);

  const randomFrom = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const rollSet = () => {
    if (rollingSet) return;
    setRollingSet(true);
    setSetValue((prev) => {
      let next = randomFrom<number>(setOptions);
      if (setOptions.length > 1) {
        while (next === prev) next = randomFrom<number>(setOptions);
      }
      return next;
    });
    setTimeout(() => setRollingSet(false), 450);
  };

  const rollRep = () => {
    if (rollingRep) return;
    setRollingRep(true);
    setRepValue((prev) => {
      let next = randomFrom<(number | string)>(repValues);
      if (repValues.length > 1) {
        while (next === prev) next = randomFrom<(number | string)>(repValues);
      }
      return next;
    });
    setTimeout(() => setRollingRep(false), 450);
  };

  const rollBoth = () => {
    rollSet();
    rollRep();
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
        Sets and Reps Dice
      </Typography>

      <Stack direction="row" spacing={4} alignItems="center">
        <Die label="Sets" value={setValue} rolling={rollingSet} onRoll={rollSet} />
        <Die label="Reps" value={repValue} rolling={rollingRep} onRoll={rollRep} />
      </Stack>

      <Typography
        component="button"
        variant="body2"
        sx={{
          mt: 2,
          cursor: "pointer",
          fontWeight: 700,
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textUnderlineOffset: 4,
          display: "inline-block",
          background: "none",
          border: "none",
          p: 0,
          color: "inherit",
          font: "inherit",
        }}
        onClick={rollBoth}
      >
        Roll both
      </Typography>
    </Box>
  );
};

export default SetRepDice;
