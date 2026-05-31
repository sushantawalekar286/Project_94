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
              color: #dc2626;
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

  if (loading && tables.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-neutral-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <span className="ml-3 font-bold text-xs">Loading QR codes...</span>
      </div>
    );
  }
  
  if (error && tables.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-red-600 font-bold">
        Failed to load QR codes.
      </div>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6 text-neutral-800">
      
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">
          Unique QR per table
        </p>
        <h1 className="mt-1 text-3xl font-black text-neutral-800 leading-tight tracking-tight">
          QR Management
        </h1>
      </div>

      {/* Stats and Generation Form Grid */}
      <div className="grid gap-6 md:grid-cols-[1fr_350px] mt-8">
        
        {/* Left Side: Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-neutral-400">Total Tables</p>
            </div>
            <h2 className="text-5xl font-black mt-4 text-red-600">{totalTables}</h2>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-neutral-400">Last Generated Table</p>
            </div>
            <h2 className="text-5xl font-black mt-4 text-red-600">{lastTableNumber ? `Table ${lastTableNumber}` : "None"}</h2>
          </div>
        </div>

        {/* Right Side: Generate New Tables Form */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-black text-neutral-800 flex items-center gap-2">
            <FaPlus className="text-red-600" size={12} /> Generate New Tables
          </h3>
          <form onSubmit={handleGenerate} className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="generate-count" className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-2">Number of Tables</label>
              <input
                id="generate-count"
                type="number"
                min="1"
                max="50"
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-bold"
              />
            </div>
            <Button type="submit" loading={generating} className="w-full py-3.5 text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm">
              <FaQrcode className="mr-1 inline" /> Generate Tables
            </Button>
          </form>
        </div>
      </div>

      {/* View Existing QR Codes section */}
      <div className="mt-12">
        <h3 className="text-xl font-black border-b border-neutral-200 pb-3 flex items-center gap-2">
          View Existing QR Codes
        </h3>
        
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => {
            const qrImageUrl = table.qrImage || table.qr?.qrDataUrl;
            const qrLinkUrl = table.qrUrl || table.qrCodeUrl || table.qr?.qrValue || `https://project-94-two.vercel.app/table/${table.number}`;
            return (
              <article key={table._id} className="rounded-3xl border border-neutral-200 bg-white p-5 flex flex-col justify-between hover:border-red-500/20 transition-colors shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-neutral-800">Table {table.number}</h2>
                    <span className={`text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold border ${
                      table.status === "available" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {table.status}
                    </span>
                  </div>
                  
                  {qrImageUrl ? (
                    <div className="mt-4 rounded-2xl bg-neutral-50 p-4 border border-neutral-100/50 flex items-center justify-center">
                      <img className="h-44 w-44 object-contain" src={qrImageUrl} alt={`QR for table ${table.number}`} />
                    </div>
                  ) : (
                    <div className="mt-4 h-44 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 border border-dashed border-neutral-200 text-xs">
                      No QR image found
                    </div>
                  )}
                  <p className="mt-4 truncate text-[9px] text-neutral-400 font-mono font-bold">URL: {qrLinkUrl}</p>
                </div>
                
                <div className="mt-5 flex gap-2">
                  <button 
                    onClick={() => handleDownload(table)} 
                    className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-1 bg-neutral-50 hover:bg-neutral-100/50 text-neutral-600 border border-neutral-200 shadow-sm transition-colors"
                  >
                    <FaDownload className="mr-1 inline" /> Download
                  </button>
                  <button 
                    onClick={() => handlePrint(table)} 
                    className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider py-2.5 px-1 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <FaPrint className="mr-1 inline" /> Print
                  </button>
                </div>
              </article>
            );
          })}
          {tables.length === 0 && (
            <div className="text-center col-span-full border border-dashed border-neutral-200 rounded-3xl p-16 bg-white space-y-4">
              <h3 className="text-lg font-black text-neutral-800">No tables found</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                No table QR codes generated yet. Please choose the count and generate them using the form above.
              </p>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
