import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchMyDemands } from "../../hooks/api/demandApi";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Match {
  id?: string;
  demandId: string;
  status: string;
}

interface Demand {
  demandId: string;
  title: string;
  demand: string;
  category: string;
  createdAt: string;
  matches: (Match | string)[];
}

// 🔄 ÄNDRAT: Lagt till timestamp i notifikationen
interface Notification {
  message: string;
  clickable: boolean;
  demand: Demand;
  timestamp: Date;
}

const NotificationsView = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔄 ÄNDRAT: Funktion för att visa "2 dagar sedan"
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just nu';
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

        const out: Notification[] = [];

        for (const d of myDemands) {
          if (!Array.isArray(d.matches)) continue;

          for (let i = d.matches.length - 1; i >= 0; i--) { // 🔄 ÄNDRAT: loopa baklänges
            const m = d.matches[i];
            if (typeof m !== "object") continue;

            const status = m.status;
            const baseTime = new Date(d.createdAt).getTime(); // 🔄
            const fakeRecentTime = new Date(baseTime + i * 1000); // 🔄 olika tid beroende på plats i listan

            if (status === "confirmedByThem") {
              out.push({
                message: `Din demand har blivit bekräftad av: "${d.title}". Acceptera för att matcha!`,
                clickable: false,
                demand: d,
                timestamp: fakeRecentTime,
              });
              break;
            }

            if (status === "matched") {
              out.push({
                message: `Du har matchats med ett behov: "${d.title}"`,
                clickable: true,
                demand: d,
                timestamp: fakeRecentTime,
              });
              break;
            }
          }
        }

        // 🔄 ÄNDRAT: sortera nyaste överst
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

  const handleClick = (demand: Demand) => {
    const slug = demand.title.toLowerCase().replace(/\s+/g, '-');
    const params = new URLSearchParams(location.search);
    params.set('tab', 'match');
    params.set('selected', slug);
    navigate(`/user/client/hem?${params.toString()}`);
  };

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
          notifications.map((note, idx) => (
            <div
              key={idx}
              onClick={note.clickable ? () => handleClick(note.demand) : undefined}
              className={`flex items-start gap-3 p-4 rounded-md shadow w-full transition-all ${
                note.clickable
                  ? "bg-white cursor-pointer hover:bg-gray-100 border-2 border-lightGreen"
                  : "bg-gray-100 cursor-default border-2 border-gray-300 opacity-90"
              }`}
            >
              {note.clickable ? (
                <CheckCircle className="text-lightGreen mt-1" size={25} />
              ) : (
                <AlertCircle className="text-yellow-300 mt-1" size={25} />
              )}

              <div className="flex flex-col">
                <p className="text-sm text-darkText">{note.message}</p>
                <span className="text-xs text-gray-500 mt-1">
                  Senast uppdaterad: {timeAgo(note.timestamp)}
                </span> {/* 🔄 ÄNDRAT: visar tidtext */}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default NotificationsView;
