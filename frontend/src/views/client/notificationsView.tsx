import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyDemands } from "../../hooks/api/demandApi";

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
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchMyDemands();
        const myDemands: Demand[] = resp.data || [];

        const out: { message: string }[] = [];

        for (const d of myDemands) {
          if (!Array.isArray(d.matches)) continue;

          for (const m of d.matches) {
            const status = typeof m === "object" ? m.status : "new";

       
            if (status === "confirmedByThem") {
              out.push({
                message: `Din demand har blivit bekräftad av användaren: "${d.title}". Acceptera för att matcha!`,
              });
              break;
            }

           
            if (status === "matched") {
              out.push({
                message: `Du har matchats med ett behov: "${d.title}"`,
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
      <h1 className="text-3xl font-semibold text-center text-darkText">Notifications</h1>

      <section className="w-full h-full bg-lightGreen rounded-md text-lightText flex flex-col items-center justify-center min-h-[200px] p-4 gap-2">
        {loading ? (
          <p>Loading notifications...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-center">Dina notiser visas här</p>
        ) : (
          notifications.map((note, idx) => (
            <button
              key={idx}
              onClick={handleClick}
              className="bg-white text-darkText px-4 py-2 rounded shadow w-full max-w-md text-sm text-left hover:bg-gray-100 transition"
            >
              {note.message}
            </button>
          ))
        )}
      </section>
    </div>
  );
};

export default NotificationsView;
