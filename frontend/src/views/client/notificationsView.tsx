import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const NotificationsView = () => {
  const [notifications, setNotifications] = useState<{ message: string; clickable: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchMyDemands();
        const myDemands: Demand[] = resp.data || [];

        const out: { message: string; clickable: boolean }[] = [];

        for (const d of myDemands) {
          if (!Array.isArray(d.matches)) continue;

          for (const m of d.matches) {
            const status = typeof m === "object" ? m.status : "new";

            if (status === "confirmedByThem") {
              out.push({
                message: `Din demand har blivit bekräftad av: "${d.title}". Acceptera för att matcha!`,
                clickable: false,
              });
              break;
            }

            if (status === "matched") {
              out.push({
                message: `Du har matchats med ett behov: "${d.title}"`,
                clickable: true,
              });
              break;
            }
          }
        }

        setNotifications(out);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleClick = () => {
    navigate("/user/client/hem?tab=match");
  };

  return (
    <div className="flex flex-col w-full overflow-y-auto p-6 items-center gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-semibold text-center text-darkText">Notiser</h1>
      </div>

      <section className="w-full h-full bg-slate-100 rounded-md text-lightText flex flex-col items-center  min-h-[200px] p-4 gap-2">
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
              onClick={note.clickable ? handleClick : undefined}
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

              <p className="text-sm text-darkText">{note.message}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default NotificationsView;
