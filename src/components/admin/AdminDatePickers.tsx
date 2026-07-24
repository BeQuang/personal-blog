"use client";

import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

function parsePickerValue(value?: string | null) {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

type AdminDateTimePickerProps = Omit<
  DatePickerProps<Dayjs, false>,
  "defaultValue" | "format" | "onChange" | "picker" | "showTime" | "value"
> & {
  value?: string | null;
  onChange?: (value?: string) => void;
};

export function AdminDateTimePicker({
  className,
  onChange,
  placeholder = "Chọn ngày và giờ",
  style,
  value,
  ...props
}: AdminDateTimePickerProps) {
  return (
    <DatePicker
      {...props}
      value={parsePickerValue(value)}
      onChange={(nextValue) => {
        onChange?.(
          nextValue
            ? nextValue.format("YYYY-MM-DDTHH:mm")
            : undefined,
        );
      }}
      format="DD/MM/YYYY HH:mm"
      showTime={{ format: "HH:mm", minuteStep: 5 }}
      placeholder={placeholder}
      className={[
        "admin-date-time-picker",
        className,
      ].filter(Boolean).join(" ")}
      style={{ width: "100%", ...style }}
    />
  );
}

export function AdminDateRangePicker({
  maxDate,
  onChange,
  value,
}: {
  maxDate?: string;
  onChange?: (value?: [string, string]) => void;
  value?: readonly [string, string] | null;
}) {
  const start = parsePickerValue(value?.[0]);
  const end = parsePickerValue(value?.[1]);
  const pickerValue: [Dayjs, Dayjs] | null =
    start && end ? [start, end] : null;

  return (
    <DatePicker.RangePicker
      value={pickerValue}
      onChange={(nextValue) => {
        const [nextStart, nextEnd] = nextValue ?? [];
        onChange?.(
          nextStart && nextEnd
            ? [
                nextStart.format("YYYY-MM-DD"),
                nextEnd.format("YYYY-MM-DD"),
              ]
            : undefined,
        );
      }}
      format="DD/MM/YYYY"
      maxDate={parsePickerValue(maxDate) ?? undefined}
      placeholder={["Từ ngày", "Đến ngày"]}
      className="admin-date-range-picker"
      allowClear
    />
  );
}
