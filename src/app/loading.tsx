import { LoadingState } from "@/components/common/LoadingState";

export default function RootLoading() {
  return (
    <LoadingState
      label="Đang tải trang, vui lòng chờ…"
      className="min-h-[55vh]"
    />
  );
}
