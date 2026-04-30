"use client";

import * as React from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

interface WidgetHeaderProps {
  title: string;
  onDelete?: () => void;
  /** Extra icon button(s) to show before the close button */
  action?: React.ReactNode;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ title, onDelete, action }) => (
  <Box
    className="widget-drag"
    sx={{
      display: "flex",
      alignItems: "center",
      px: 1.5,
      py: 1,
      borderBottom: "1px solid",
      borderColor: "divider",
      cursor: "move",
      bgcolor: "background.paper",
      borderRadius: "inherit",
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      flexShrink: 0,
      minHeight: 44,
      gap: 1,
    }}
  >
    <DragIndicatorIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} />

    <Typography
      variant="subtitle2"
      fontWeight={700}
      noWrap
      sx={{ flex: 1, fontSize: 13, userSelect: "none" }}
    >
      {title}
    </Typography>

    {/* Optional extra action buttons */}
    {action}

    {/* Delete / close */}
    {onDelete && (
      <Tooltip title="Remove widget">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{ p: 0.25, color: "text.secondary", "&:hover": { color: "error.main" } }}
          aria-label="remove widget"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);
