import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaQrcode, FaDownload, FaPrint, FaPlus } from "react-icons/fa";
import { generateQRCodes, getQRCodes } from "../../services/qrService";
import Button from "../../components/common/Button";

export default function QRManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generating, setGenerating] = useState(false);

  const refresh = () => {
    setLoading(true);
    getQRCodes()
      .then((res) => {
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (generateCount <= 0) {
      toast.error("Please enter a positive number of tables to generate");
      return;
    }
    setGenerating(true);
    try {
      await generateQRCodes(generateCount);
      toast.success(`Successfully generated ${generateCount} new table(s)`);
      refresh();
    } catch (err) {
      toast.error("Failed to generate QR codes");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (table) => {
    const qrImageUrl = table.qrImage || table.qr?.qrDataUrl;
    if (!qrImageUrl) return toast.error("QR code image not found");
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `table-${table.number}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = (table) => {
    const qrImageUrl = table.qrImage || table.qr?.qrDataUrl;
    if (!qrImageUrl) return toast.error("QR code image not found");
    
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - Table ${table.number}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
              background: white;
              color: black;
            }
            .container {
              text-align: center;
              border: 3px solid #000;
              padding: 50px;
              border-radius: 30px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            img {
              width: 320px;
              height: 320px;
              object-fit: contain;
              margin-bottom: 20px;
            }
            h1 {
              margin: 10px 0;
              font-size: 38px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            p {
              font-size: 16px;
              color: #555;
              margin: 5px 0 0 0;
              font-weight: 600;
            }
            .logo {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 3px;
              color: #c5a880;
              font-weight: 800;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="container">
            <div class="logo">Aurum Bistro</div>
            <img src="${qrImageUrl}" alt="Table ${table.number}" />
            <h1>Table ${table.number}</h1>
            <p>Scan to view Menu & Order</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalTables = tables.length;
  const lastTableNumber = tables.reduce((max, t) => Math.max(max, t.number || 0), 0);

  if (loading && tables.length === 0) return <div className="flex h-screen items-center justify-center text-white/55">Loading QR codes...</div>;
  if (error && tables.length === 0) return <div className="flex h-screen items-center justify-center text-red-400">Failed to load QR codes.</div>;

  return (
    <section className="px-4 py-6 sm:px-8 text-white min-h-screen">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Unique QR per table</p>
          <h1 className="text-4xl font-black mt-1">QR Management</h1>
        </div>
      </header>

      {/* Stats and Generation Form Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_350px]">
        {/* Left Side: Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col justify-between">
            <p className="text-xs uppercase tracking-wider text-white/50">Total Tables</p>
            <h2 className="text-5xl font-black mt-4 text-gold-400">{totalTables}</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col justify-between">
            <p className="text-xs uppercase tracking-wider text-white/50">Last Generated Table</p>
            <h2 className="text-5xl font-black mt-4 text-gold-400">{lastTableNumber ? `Table ${lastTableNumber}` : "None"}</h2>
          </div>
        </div>

        {/* Right Side: Generate New Tables Form */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-glow backdrop-blur">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaPlus className="text-gold-400" size={14} /> Generate New Tables
          </h3>
          <form onSubmit={handleGenerate} className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="generate-count" className="text-xs text-white/60 block mb-2">Number of Tables</label>
              <input
                id="generate-count"
                type="number"
                min="1"
                max="50"
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-gold-400 transition-colors"
              />
            </div>
            <Button type="submit" loading={generating} className="w-full">
              <FaQrcode /> Generate Tables
            </Button>
          </form>
        </div>
      </div>

      {/* View Existing QR Codes section */}
      <div className="mt-12">
        <h3 className="text-2xl font-black border-b border-white/15 pb-3">View Existing QR Codes</h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => {
            const qrImageUrl = table.qrImage || table.qr?.qrDataUrl;
            const qrLinkUrl = table.qrUrl || table.qrCodeUrl || table.qr?.qrValue || `https://project-94-two.vercel.app/table/${table.number}`;
            return (
              <article key={table._id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 flex flex-col justify-between hover:border-gold-400/30 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black">Table {table.number}</h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold ${
                      table.status === "available" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                    }`}>
                      {table.status}
                    </span>
                  </div>
                  {qrImageUrl ? (
                    <div className="mt-4 rounded-2xl bg-white p-4 flex items-center justify-center shadow-inner">
                      <img className="h-44 w-44 object-contain" src={qrImageUrl} alt={`QR for table ${table.number}`} />
                    </div>
                  ) : (
                    <div className="mt-4 h-44 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-dashed border-white/10">
                      No QR image found
                    </div>
                  )}
                  <p className="mt-4 truncate text-xs text-white/45 font-mono">URL: {qrLinkUrl}</p>
                </div>
                
                <div className="mt-5 flex gap-2">
                  <Button onClick={() => handleDownload(table)} variant="secondary" className="flex-1 text-xs py-2 px-1">
                    <FaDownload /> Download
                  </Button>
                  <Button onClick={() => handlePrint(table)} variant="secondary" className="flex-1 text-xs py-2 px-1 border-gold-400/40 text-gold-400 hover:bg-gold-400/10">
                    <FaPrint /> Print
                  </Button>
                </div>
              </article>
            );
          })}
          {tables.length === 0 && (
            <p className="mt-4 text-white/55 col-span-full text-center py-10">No tables found. Please click Generate Tables above to add tables.</p>
          )}
        </div>
      </div>
    </section>
  );
}
