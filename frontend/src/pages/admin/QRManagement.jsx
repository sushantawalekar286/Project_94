import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaQrcode, FaDownload } from "react-icons/fa";
import { generateQRCodes, getQRCodes } from "../../services/qrService";
import Button from "../../components/common/Button";

export default function QRManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = () => {
    setLoading(true);
    getQRCodes()
      .then((res) => {
        // Safe extraction of response
        const arrayData = res.data?.data || res.data || [];
        setTables(Array.isArray(arrayData) ? arrayData : []);
        setError(false);
      })
      .catch(() => {
        setTables([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { refresh(); }, []);

  const generate = async () => {
    try {
      await generateQRCodes();
      toast.success("QR codes generated");
      refresh();
    } catch (err) {
      toast.error("Failed to generate QR codes");
    }
  };

  const handleDownload = (table) => {
    const qrUrl = table.qrCodeUrl || table.qr?.qrDataUrl;
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `table-${table.number}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white/55">Loading QR codes...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-400">Failed to load QR codes.</div>;

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Unique QR per table</p>
      <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h1 className="text-4xl font-black">QR Management</h1>
        <Button onClick={generate}><FaQrcode /> Generate QR Codes</Button>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tables?.map((table) => {
          const qrUrl = table.qrCodeUrl || table.qr?.qrDataUrl;
          return (
            <article key={table._id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Table {table.number}</h2>
                <Button onClick={() => handleDownload(table)} variant="secondary" className="px-3 py-1 text-sm"><FaDownload /> Download</Button>
              </div>
              {qrUrl ? <img className="mt-4 rounded-2xl bg-white p-3 w-full object-contain" src={qrUrl} alt={`QR for table ${table.number}`} /> : <p className="mt-4 text-white/55">Generate to create QR image.</p>}
              <p className="mt-4 truncate text-sm text-white/45">Token: {table.token}</p>
            </article>
          );
        })}
        {(!tables || tables.length === 0) && <p className="mt-4 text-white/55 col-span-full">No tables found. Please configure tables in the system.</p>}
      </div>
    </section>
  );
}
