"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loadProfile } from "@/lib/load-profile";
import { Profile } from "../profile/page";

import {
  Box,
  CssBaseline,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Stack,
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

import NewAccountSetup from "../../components/dashboard/accSetup";
import CalendarCard from "../../components/widgets/CalendarCard";
import {
  KPI,
  TodayClassesWidget,
  CampusEventTrackerWidget,
  DMNotificationsWidget,
  StickyNoteWidget,
  CanvasAssignmentsWidget,
  CitationGeneratorWidget,
  MarketplaceSuggestWidget,
  PhotoPinWidget,
  WeatherWidget,
  SundialNewsWidget,
} from "../../components/widgets";
import DashboardSidebar from "../../components/dashboard/sidebar";

const drawerWidth = 220;

const assignmentsDone = 18;
type ClassProgress = { name: string; done: number; pending: number };
const classes: ClassProgress[] = [
  { name: "Class 1", done: 8, pending: 2 },
  { name: "Class 2", done: 5, pending: 4 },
  { name: "Class 3", done: 7, pending: 1 },
];

// TEMP: backend should toggle this based on whether the user has completed profile setup
const IS_NEW_ACCOUNT = true;

export default function DashboardPage() {
  const router = useRouter();

const [profile, setProfile] = React.useState<Profile>(loadProfile());

const name = profile?.first + " " + profile?.last;


  

  const gridRef = React.useRef<HTMLDivElement>(null);
  const gridInstance = React.useRef<GridStack | null>(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const openLibrary = () => setAddOpen(true);
  const closeLibrary = () => setAddOpen(false);

  // NEW ACCOUNT ALERT STATE
  const [showNewBanner, setShowNewBanner] = React.useState(IS_NEW_ACCOUNT);
  const [showNewConfirm, setShowNewConfirm] = React.useState(false);

  // LOGOUT HANDLER: clears auth token and returns to base page
  const handleLogout = React.useCallback(() => {
    localStorage.clear();
    router.push("/");
  }, [router]);

  const saveLayout = () => {
    const grid = gridInstance.current;
    if (!grid) return;
    const layout = grid.save(false);
    localStorage.setItem("dashboard-layout", JSON.stringify(layout));
  };

  const removeWidgetById = (id: string) => {
    const grid = gridInstance.current;
    if (!grid) return;
    const el = grid.engine.nodes.find(
      (n) => n.el?.getAttribute("gs-id") === id
    )?.el;
    if (el) grid.removeWidget(el);
    saveLayout();
  };

  const addWidget = async (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    content: React.ReactNode
  ) => {
    const grid = gridInstance.current;
    if (!grid) return;

    const el = document.createElement("div");
    el.className = "grid-stack-item";
    el.setAttribute("gs-id", id);
    el.setAttribute("gs-x", String(x));
    el.setAttribute("gs-y", String(y));
    el.setAttribute("gs-w", String(w));
    el.setAttribute("gs-h", String(h));

    const inner = document.createElement("div");
    inner.className = "grid-stack-item-content";
    el.appendChild(inner);

    (grid as any).el.appendChild(el);
    grid.makeWidget(el as any);

    const { createRoot } = await import("react-dom/client");
    const root = createRoot(inner);
    root.render(content);

    saveLayout();
  };

  const addSticky = () => {
    const id = `sticky-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      3,
      2,
      <StickyNoteWidget id={id} onDelete={() => removeWidgetById(id)} />
    );
  };
  const addCampusEvents = () => {
    const id = `events-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      4,
      3,
      <CampusEventTrackerWidget onDelete={() => removeWidgetById(id)} />
    );
  };
  const addDM = () => {
    const id = `dm-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      3,
      2,
      <DMNotificationsWidget onDelete={() => removeWidgetById(id)} />
    );
  };

  const addWeather = () => {
    const id = `weather-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      3,
      2,
      <WeatherWidget onDelete={() => removeWidgetById(id)} />
    );
  };

  const addCalendar = () => {
    const id = `cal-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      4,
      4,
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            "&::-webkit-scrollbar": { width: 10, height: 10 },
            "&::-webkit-scrollbar-track": {
              bgcolor: "rgba(0,0,0,0.05)",
              borderRadius: 1,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "rgba(0,0,0,0.25)",
              borderRadius: 1,
              "&:hover": { bgcolor: "rgba(0,0,0,0.35)" },
            },
          }}
        >
          <CalendarCard onClose={() => removeWidgetById(id)} />
        </Box>
      </Card>
    );
  };
  const addCanvasAssignments = () => {
    const id = `canvas-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      5,
      3,
      <CanvasAssignmentsWidget
        onDelete={() => removeWidgetById(id)}
      />
    );
  };
  const addCitationGenerator = () => {
    const id = `citer-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      5,
      4,
      <CitationGeneratorWidget
        onDelete={() => removeWidgetById(id)}
      />
    );
  };
  const addMarketplaceSuggest = () => {
    const id = `mkt-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      4,
      3,
      <MarketplaceSuggestWidget
        onDelete={() => removeWidgetById(id)}
      />
    );
  };
  const addPhotoPin = () => {
    const id = `photo-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      4,
      4,
      <PhotoPinWidget id={id} onDelete={() => removeWidgetById(id)} />
    );
  };

  // ── NEW: Sundial News Widget ──────────────────────────────────────────────────
  const addSundialNews = () => {
    const id = `sundial-${Math.random().toString(36).slice(2, 7)}`;
    addWidget(
      id,
      0,
      0,
      4,
      4,
      <SundialNewsWidget onDelete={() => removeWidgetById(id)} />
    );
  };

  // init gridstack
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!gridRef.current || gridInstance.current) return;

    const grid = GridStack.init(
      {
        float: true,
        cellHeight: 110,
        minRow: 1,
        draggable: { handle: ".widget-drag" },
        resizable: { handles: "se, s, e" },
        margin: 8,
      },
      gridRef.current
    );

    // initial widgets
    addWidget(
      "kpi1",
      0,
      0,
      3,
      1,
      <KPI
        label="Current GPA"
        value="3.67"
        hint="+0.12 from last semester"
        onDelete={() => removeWidgetById("kpi1")}
      />
    );
    addWidget(
      "kpi2",
      3,
      0,
      3,
      1,
      <KPI
        label="Assignments Done"
        value={String(assignmentsDone)}
        hint="this term"
        onDelete={() => removeWidgetById("kpi2")}
      />
    );
    addWidget(
      "kpi3",
      6,
      0,
      3,
      1,
      <KPI
        label="Pending Assignments"
        value={String(
          classes.reduce((s, c) => s + c.pending, 0)
        )}
        hint="across classes"
        onDelete={() => removeWidgetById("kpi3")}
      />
    );
    addWidget(
      "kpi4",
      9,
      0,
      3,
      1,
      <KPI
        label="Clubs Joined"
        value="4"
        onDelete={() => removeWidgetById("kpi4")}
      />
    );

    addWidget(
      "calendar",
      0,
      1,
      4,
      4,
      <Card
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ p: 1 }}>
          <CalendarCard
            onClose={() => removeWidgetById("calendar")}
          />
        </Box>
      </Card>
    );
    addWidget(
      "today",
      9,
      1,
      3,
      4,
      <TodayClassesWidget
        onDelete={() => removeWidgetById("today")}
      />
    );

    grid.on("change", saveLayout);

    grid.on("dragstop", (_event, el: HTMLElement) => {
      const dragged: any = (el as any).gridstackNode;
      if (!dragged) {
        saveLayout();
        return;
      }

      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const targetEl = document
        .elementFromPoint(cx, cy)
        ?.closest(".grid-stack-item") as HTMLElement | null;

      if (!targetEl || targetEl === el) {
        saveLayout();
        return;
      }

      const target: any = (targetEl as any).gridstackNode;
      if (!target) {
        saveLayout();
        return;
      }

      const tr = targetEl.getBoundingClientRect();
      const leftHalf = cx < tr.left + tr.width / 2;

      const cols = grid.getColumn();
      const y = target.y;

      const newDraggedX = leftHalf
        ? target.x
        : Math.min(
            cols - dragged.w,
            target.x + Math.max(0, target.w - dragged.w)
          );
      const newTargetX = leftHalf
        ? Math.min(cols - target.w, target.x + dragged.w)
        : Math.max(0, target.x - dragged.w);

      const origDragged = {
        x: dragged.x,
        y: dragged.y,
        w: dragged.w,
        h: dragged.h,
      };
      const origTarget = {
        x: target.x,
        y: target.y,
        w: target.w,
        h: target.h,
      };

      grid.batchUpdate();
      try {
        grid.update(targetEl, { x: newTargetX, y });
        grid.update(el, { x: newDraggedX, y });

        const dNode = (el as any).gridstackNode;
        const tNode = (targetEl as any).gridstackNode;
        const landed =
          dNode &&
          tNode &&
          dNode.x === newDraggedX &&
          dNode.y === y &&
          tNode.x === newTargetX &&
          tNode.y === y;

        if (!landed) {
          grid.update(targetEl, origTarget);
          grid.update(el, origDragged);
        }
      } finally {
        grid.batchUpdate(false);
      }

      saveLayout();
    });

    gridInstance.current = grid;
  }, []); // eslint-disable-line

  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafb", minHeight: "100vh" }}>
      <CssBaseline />

      <DashboardSidebar
        drawerWidth={drawerWidth}
        onLogout={handleLogout}
      />

      {/* Main */}
      <Box
        component="main"
        sx={{
          position: "relative",
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <NewAccountSetup />

        <div ref={gridRef} className="grid-stack" />

        <Fab
          onClick={openLibrary}
          sx={{ position: "fixed", right: 24, bottom: 24 }}
          color="primary"
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Add Widget Library */}
      <Dialog open={addOpen} onClose={closeLibrary} fullWidth maxWidth="sm">
        <DialogTitle>Add a widget</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} mt={1}>
            {/* ── Outlined (utility) widgets ── */}
            <Button variant="outlined" onClick={addSticky}>
              Sticky Note
            </Button>
            <Button variant="outlined" onClick={addCampusEvents}>
              Campus Events Tracker
            </Button>
            <Button variant="outlined" onClick={addDM}>
              DM Notifications
            </Button>
            <Button variant="outlined" onClick={addCalendar}>
              Calendar
            </Button>
            <Button variant="outlined" onClick={addWeather}>
              CSUN Weather
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const id = `today-${Math.random()
                  .toString(36)
                  .slice(2, 7)}`;
                addWidget(
                  id,
                  0,
                  0,
                  3,
                  4,
                  <TodayClassesWidget
                    onDelete={() => removeWidgetById(id)}
                  />
                );
              }}
            >
              Today's Classes
            </Button>

            <Divider />

            {/* ── Contained (featured) widgets ── */}
            <Button
              variant="contained"
              onClick={addCanvasAssignments}
            >
              Canvas Assignment Tracker
            </Button>
            <Button
              variant="contained"
              onClick={addCitationGenerator}
            >
              Citation Generator (APA/MLA)
            </Button>
            <Button
              variant="contained"
              onClick={addMarketplaceSuggest}
            >
              Marketplace Suggestions
            </Button>
            <Button variant="contained" onClick={addPhotoPin}>
              Photo Pin (upload and pin)
            </Button>

            {/* ── Sundial News — part of the red contained set ── */}
            <Button variant="contained" onClick={addSundialNews}>
              The Sundial — Campus News
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLibrary}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
