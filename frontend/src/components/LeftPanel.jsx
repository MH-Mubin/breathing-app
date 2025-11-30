export default function LeftPanel({ stats }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm w-full">
      <h3 className="font-semibold">Today</h3>
      <div className="mt-2">
        <p className="text-sm">
          Streak: <strong>{stats?.streak ?? 0}</strong>
        </p>
        <p className="text-sm">
          Sessions: <strong>{stats?.totalSessions ?? 0}</strong>
        </p>
        <p className="text-sm">
          Minutes: <strong>{stats?.totalMinutes ?? 0}</strong>
        </p>
      </div>
    </div>
  );
}
