"use client";

import { CalendarX2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { EventCard } from "@/components/events/EventCard";
import { eventStatusLabels, eventTypeLabels } from "@/config/event.config";
import type { EventItem, EventStatus, EventType } from "@/types";

const ALL_FILTER = "all";
type TypeFilter = typeof ALL_FILTER | EventType;
type StatusFilter = typeof ALL_FILTER | EventStatus;

interface EventExplorerProps {
  events: readonly EventItem[];
  types: readonly EventType[];
}

interface EventGroupProps {
  title: string;
  description: string;
  events: readonly EventItem[];
}

function EventGroup({ title, description, events }: EventGroupProps) {
  return (
    <section aria-label={title}>
      <div>
        <h3 className="text-2xl font-bold tracking-[-0.025em]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      {events.length > 0 ? (
        <div className="mt-5 grid gap-5">
          {events.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-6 text-sm text-[var(--text-muted)]">
          Chưa có sự kiện phù hợp trong nhóm này.
        </p>
      )}
    </section>
  );
}

export function EventExplorer({ events, types }: EventExplorerProps) {
  const [type, setType] = useState<TypeFilter>(ALL_FILTER);
  const [status, setStatus] = useState<StatusFilter>(ALL_FILTER);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesType = type === ALL_FILTER || event.type === type;
        const matchesStatus = status === ALL_FILTER || event.status === status;
        return matchesType && matchesStatus;
      }),
    [events, status, type],
  );
  const liveEvents = filteredEvents.filter((event) => event.status === "live");
  const upcomingEvents = filteredEvents.filter((event) => event.status === "upcoming");
  const pastEvents = filteredEvents.filter(
    (event) => event.status === "ended" || event.status === "cancelled",
  );
  const hasActiveFilters = type !== ALL_FILTER || status !== ALL_FILTER;

  function resetFilters() {
    setType(ALL_FILTER);
    setStatus(ALL_FILTER);
  }

  return (
    <section aria-labelledby="event-library-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
            Lịch hoạt động
          </p>
          <h2
            id="event-library-title"
            className="mt-2 text-[length:var(--text-h2)] font-bold tracking-[-0.03em]"
          >
            Sự kiện và hoạt động cộng đồng
          </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          {filteredEvents.length} sự kiện
        </p>
      </div>

      <div className="mt-7 grid gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background)] px-4 text-[var(--text-muted)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-soft)]">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span className="sr-only">Lọc theo loại sự kiện</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TypeFilter)}
            className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-[var(--text-primary)] outline-none"
          >
            <option value={ALL_FILTER}>Tất cả loại sự kiện</option>
            {types.map((item) => (
              <option value={item} key={item}>
                {eventTypeLabels[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-h-12 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background)] px-4 text-[var(--text-muted)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-soft)]">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span className="sr-only">Lọc theo trạng thái sự kiện</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-[var(--text-primary)] outline-none"
          >
            <option value={ALL_FILTER}>Tất cả trạng thái</option>
            {(Object.keys(eventStatusLabels) as EventStatus[]).map((item) => (
              <option value={item} key={item}>
                {eventStatusLabels[item]}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters ? (
          <Button variant="ghost" onClick={resetFilters} className="sm:col-span-2 lg:col-span-1">
            <RotateCcw size={17} aria-hidden="true" /> Xóa bộ lọc
          </Button>
        ) : null}
      </div>

      {filteredEvents.length > 0 ? (
        <div className="mt-10 space-y-12">
          <EventGroup
            title="Đang trực tiếp"
            description="Các hoạt động đang diễn ra ngay lúc này."
            events={liveEvents}
          />
          <EventGroup
            title="Sắp diễn ra"
            description="Lưu lại lịch để không bỏ lỡ hoạt động tiếp theo."
            events={upcomingEvents}
          />
          <EventGroup
            title="Đã diễn ra"
            description="Những sự kiện đã kết thúc hoặc được cập nhật trạng thái."
            events={pastEvents}
          />
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<CalendarX2 size={22} aria-hidden="true" />}
          title="Không tìm thấy sự kiện"
          description="Thử một loại hoặc trạng thái khác để xem lịch hoạt động."
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw size={17} aria-hidden="true" /> Xóa bộ lọc
              </Button>
            ) : undefined
          }
        />
      )}
    </section>
  );
}
