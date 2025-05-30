import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchMyDemands, markMatchAsSeen } from "../../hooks/api/demandApi";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Match {
  id?: string;
  demandId: string;
  status: string;
  seen?: boolean;
  updatedAt?: string;
}

interface Demand {
  demandId: string;
  title: string;
  demand: string;
  category: string;
  createdAt: string;
  matches: (Match | string)[];
}

interface Notification {
  message: string;
  clickable: boolean;
  demand: Demand;
  matchId: string;
  timestamp: Date;
  seen: boolean;
}

const NotificationsView = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just nu";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min sedan`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} tim sedan`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} dagar sedan`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchMyDemands();
        const myDemands: Demand[] = resp.data || [];

        console.log("Hämtade demands:", myDemands);

        const out: Notification[] = [];

        for (const d of myDemands) {
          if (!Array.isArray(d.matches)) continue;

          for (let i = d.matches.length - 1; i >= 0; i--) {
            const m = d.matches[i];
            if (typeof m !== "object" || !m.status) continue;

            const status = m.status;
            const seen = m.seen ?? false;
            const updatedAt = m.updatedAt
              ? new Date(m.updatedAt)
              : new Date(new Date(d.createdAt).getTime() + i * 1000);

            if (status === "confirmedByThem") {
              out.push({
                message: `Din demand har blivit bekräftad av: "${d.title}". Acceptera för att matcha!`,
                clickable: true, // 🟢 ändrat från false till true
                demand: d,
                matchId: m.id ?? "",
                timestamp: updatedAt,
                seen,
              });
              break;
            }

            if (status === "matched") {
              out.push({
                message: `Du har matchats med ett behov: "${d.title}"`,
                clickable: true,
                demand: d,
                matchId: m.id ?? "",
                timestamp: updatedAt,
                seen,
              });
              break;
            }
          }
        }

        out.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(out);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleClick = async (demand: Demand, matchId: string) => {
    if (matchId) {
      try {
        console.log("Markera som läst:", demand.demandId, matchId);
        await markMatchAsSeen(demand.demandId, matchId);
        window.location.reload(); // 🔄 tvångsuppdatering
      } catch (err) {
        console.error("Kunde inte markera som läst:", err);
      }
    }
  };

  const newNotifications = notifications.filter((n) => !n.seen);
  const oldNotifications = notifications.filter((n) => n.seen);

  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 items-center gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-semibold text-center text-darkText">Notiser</h1>
      </div>

      <section className="w-full h-full bg-slate-100 rounded-md text-lightText flex flex-col items-center min-h-[200px] p-4 gap-2">
        {loading ? (
          <p className="text-center">Hämtar notiser...</p>
        ) : error ? (
          <p className="text-center text-red-600">Fel: {error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-darkText">Dina notiser visas här</p>
        ) : (
          <>
            {newNotifications.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-darkText mt-2">Nya notiser</h2>
                {newNotifications.map((note, idx) => (
                  <div
                    key={`new-${idx}`}
                    onClick={note.clickable ? () => handleClick(note.demand, note.matchId) : undefined}
                    className="flex items-start gap-3 p-4 rounded-md shadow w-full transition-all bg-white cursor-pointer hover:bg-gray-100 border-2 border-lightGreen"
                  >
                    <CheckCircle className="text-lightGreen mt-1" size={25} />
                    <div className="flex flex-col">
                      <p className="text-sm text-darkText">{note.message}</p>
                      <span className="text-xs text-gray-500 mt-1">
                        Senast uppdaterad: {timeAgo(note.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {oldNotifications.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-darkText mt-4">Tidigare notiser</h2>
                {oldNotifications.map((note, idx) => (
                  <div
                    key={`old-${idx}`}
                    onClick={note.clickable ? () => handleClick(note.demand, note.matchId) : undefined}
                    className="flex items-start gap-3 p-4 rounded-md shadow w-full transition-all bg-gray-100 border-2 border-gray-300 opacity-90"
                  >
                    <AlertCircle className="text-yellow-300 mt-1" size={25} />
                    <div className="flex flex-col">
                      <p className="text-sm text-darkText">{note.message}</p>
                      <span className="text-xs text-gray-500 mt-1">
                        Senast uppdaterad: {timeAgo(note.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default NotificationsView;
