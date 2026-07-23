export default function AdminLoading() {
  return (
    <div className="admin-route-loading" role="status" aria-live="polite">
      <span className="sr-only">Đang tải dữ liệu quản trị, vui lòng chờ…</span>
      <div className="admin-loading-heading">
        <span />
        <span />
      </div>
      <div className="admin-loading-toolbar" />
      <div className="admin-loading-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="admin-loading-card" key={index}>
            <span />
            <strong />
            <small />
          </div>
        ))}
      </div>
      <div className="admin-loading-panel" aria-hidden="true" />
    </div>
  );
}
