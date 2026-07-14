import { useEffect, useRef, useState } from "react";

const MARKER_TEXT = "pregúntarle a la autora";
const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE_PX = 10;

const csrfToken = () =>
  document.querySelector('meta[name="csrf-token"]')?.content;

async function apiCreateMarker({ page, x, y }) {
  const response = await fetch("/anotate/markers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken(),
      Accept: "application/json",
    },
    body: JSON.stringify({ pdf_marker: { page, x, y } }),
  });
  if (!response.ok) throw new Error(`create failed: ${response.status}`);
  return response.json();
}

async function apiDeleteMarker(id) {
  const response = await fetch(`/anotate/markers/${id}`, {
    method: "DELETE",
    headers: { "X-CSRF-Token": csrfToken(), Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`delete failed: ${response.status}`);
}

const markerClasses =
  "absolute -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap " +
  "text-sm font-semibold text-red-600 underline";

function Marker({ marker, onDelete }) {
  return (
    <span
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onDelete(marker);
      }}
      className={`${markerClasses} cursor-pointer`}
      style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
    >
      {MARKER_TEXT}
    </span>
  );
}

function Page({ page, aspect, markers, onPlace, onDelete }) {
  const containerRef = useRef(null);
  const pressRef = useRef(null);
  const draggingRef = useRef(false);
  const [provisional, setProvisional] = useState(null);

  // While dragging a provisional marker, block touch scrolling so the
  // drag tracks the finger instead of panning the document.
  useEffect(() => {
    if (!provisional) return undefined;
    const block = (e) => e.preventDefault();
    document.addEventListener("touchmove", block, { passive: false });
    return () => document.removeEventListener("touchmove", block);
  }, [provisional]);

  const fractionFor = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    return {
      x: clamp((clientX - rect.left) / rect.width),
      y: clamp((clientY - rect.top) / rect.height),
    };
  };

  const cancelPress = () => {
    if (pressRef.current) clearTimeout(pressRef.current.timer);
    pressRef.current = null;
  };

  const handlePointerDown = (e) => {
    if (draggingRef.current) return;
    const { clientX, clientY, pointerId } = e;
    pressRef.current = {
      startX: clientX,
      startY: clientY,
      timer: setTimeout(() => {
        pressRef.current = null;
        draggingRef.current = true;
        containerRef.current.setPointerCapture(pointerId);
        setProvisional(fractionFor(clientX, clientY));
      }, LONG_PRESS_MS),
    };
  };

  const handlePointerMove = (e) => {
    if (draggingRef.current) {
      setProvisional(fractionFor(e.clientX, e.clientY));
    } else if (pressRef.current) {
      const dx = e.clientX - pressRef.current.startX;
      const dy = e.clientY - pressRef.current.startY;
      if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) cancelPress();
    }
  };

  const handlePointerUp = (e) => {
    cancelPress();
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setProvisional(null);
    onPlace(page, fractionFor(e.clientX, e.clientY));
  };

  const handlePointerCancel = () => {
    cancelPress();
    draggingRef.current = false;
    setProvisional(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ aspectRatio: `1 / ${aspect}`, WebkitTouchCallout: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={`/anotate/pages/${page}`}
        loading="lazy"
        alt={`Página ${page}`}
        draggable="false"
        className="pointer-events-none h-full w-full select-none"
      />
      {markers.map((marker) => (
        <Marker key={marker.id} marker={marker} onDelete={onDelete} />
      ))}
      {provisional && (
        <span
          className={`${markerClasses} pointer-events-none opacity-70`}
          style={{
            left: `${provisional.x * 100}%`,
            top: `${provisional.y * 100}%`,
          }}
        >
          {MARKER_TEXT}
        </span>
      )}
    </div>
  );
}

export default function Anotate({ pageCount, pageAspect, markers: initialMarkers }) {
  const [markers, setMarkers] = useState(initialMarkers);

  const place = async (page, { x, y }) => {
    const temp = { id: `temp-${Date.now()}`, page, x, y };
    setMarkers((current) => [...current, temp]);
    try {
      const saved = await apiCreateMarker({ page, x, y });
      setMarkers((current) =>
        current.map((m) => (m.id === temp.id ? saved : m))
      );
    } catch {
      setMarkers((current) => current.filter((m) => m.id !== temp.id));
      alert("No se pudo guardar el marcador");
    }
  };

  const remove = async (marker) => {
    setMarkers((current) => current.filter((m) => m.id !== marker.id));
    try {
      await apiDeleteMarker(marker.id);
    } catch {
      setMarkers((current) => [...current, marker]);
      alert("No se pudo borrar el marcador");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
        <Page
          key={page}
          page={page}
          aspect={pageAspect}
          markers={markers.filter((m) => m.page === page)}
          onPlace={place}
          onDelete={remove}
        />
      ))}
    </div>
  );
}
