import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash, FaPen, FaMoneyBillWave, FaCalendarDay, FaCalendarWeek } from "react-icons/fa";
import { createExpense, deleteExpense, getExpenseSummary, listExpenses, updateExpense } from "../../services/expenseService";

const emptyExpense = {
  title: "",
  category: "Materials",
  quantity: 1,
  amount: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: ""
};

export default function ExpensesDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ monthTotal: 0, weekTotal: 0, todayTotal: 0, monthlySeries: [] });
  const [form, setForm] = useState(emptyExpense);
  const [editingId, setEditingId] = useState("");

  const refresh = () => {
    listExpenses()
      .then((res) => {
        const arrayData = res.data?.data || res.data || [];
        setExpenses(Array.isArray(arrayData) ? arrayData : []);
      })
      .catch(() => setExpenses([]));

    getExpenseSummary()
      .then((res) => {
        const data = res.data || {};
        setSummary({
          monthTotal: data.monthTotal || 0,
          weekTotal: data.weekTotal || 0,
          todayTotal: data.todayTotal || 0,
          monthlySeries: data.monthlySeries || []
        });
      })
      .catch(() => setSummary({ monthTotal: 0, weekTotal: 0, todayTotal: 0, monthlySeries: [] }));
  };

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        amount: Number(form.amount)
      };
      if (editingId) {
        await updateExpense(editingId, payload);
        toast.success("Expense updated");
      } else {
        await createExpense(payload);
        toast.success("Expense added");
      }
      setForm(emptyExpense);
      setEditingId("");
      refresh();
    } catch {
      toast.error("Unable to save expense");
    }
  };

  const editExpense = (expense) => {
    setEditingId(expense._id);
    setForm({
      title: expense.title || "",
      category: expense.category || "Materials",
      quantity: expense.quantity || 1,
      amount: expense.amount || "",
      purchaseDate: expense.purchaseDate ? new Date(expense.purchaseDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: expense.notes || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      refresh();
    } catch {
      toast.error("Unable to delete expense");
    }
  };

  const cards = useMemo(() => ([
    ["Total monthly expenses", `₹${Number(summary.monthTotal || 0).toFixed(2)}`, FaMoneyBillWave, "border-red-100 bg-red-50 text-red-700"],
    ["Today's expenses", `₹${Number(summary.todayTotal || 0).toFixed(2)}`, FaCalendarDay, "border-emerald-100 bg-emerald-50 text-emerald-700"],
    ["This week's expenses", `₹${Number(summary.weekTotal || 0).toFixed(2)}`, FaCalendarWeek, "border-blue-100 bg-blue-50 text-blue-700"]
  ]), [summary]);

  const inputClass = "w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-colors duration-200 mb-3 font-semibold";
  const textareaClass = "w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-colors duration-200 mb-3 min-h-24 resize-none font-semibold";

  return (
    <section className="px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6 text-neutral-800">
      
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-red-600 font-black">
          Material usage tracker
        </p>
        <h1 className="mt-1 text-3xl font-black text-neutral-800 leading-tight tracking-tight">
          Expenses Dashboard
        </h1>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, Icon, colorClasses]) => (
          <article key={label} className={`rounded-3xl border p-5 shadow-sm bg-white flex items-center justify-between ${colorClasses}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70">{label}</p>
              <p className="text-2xl font-black mt-1 leading-none text-neutral-800">{value}</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-white border border-neutral-100 shadow-sm">
              <Icon className="text-lg" />
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        
        {/* Form */}
        <form onSubmit={submit} className="rounded-3xl border border-neutral-200/60 bg-white p-5 h-fit shadow-sm space-y-1">
          <h2 className="text-base font-black text-neutral-800 border-b border-neutral-100 pb-3 mb-4">
            {editingId ? "Edit Expense" : "Add Expense"}
          </h2>
          
          <input className={inputClass} placeholder="Material name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className={inputClass} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputClass} type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <input className={inputClass} type="number" min="0" placeholder="Cost" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <input className={inputClass} type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required />
          <textarea className={textareaClass} placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          
          <button type="submit" className="w-full rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3.5 text-xs font-black text-white shadow-sm uppercase tracking-wider transition-colors">
            {editingId ? <><FaPen className="mr-2 inline" />Update Expense</> : <><FaMoneyBillWave className="mr-2 inline" />Add Expense</>}
          </button>
        </form>

        {/* Monthly Series */}
        <div className="rounded-3xl border border-neutral-200/60 bg-white p-5 shadow-sm flex flex-col justify-start">
          <h2 className="text-base font-black text-neutral-800 border-b border-neutral-100 pb-3 mb-4">
            Monthly Reports
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(summary.monthlySeries || []).map((entry) => (
              <div key={entry._id} className="rounded-2xl border border-neutral-200/60 bg-neutral-50/30 p-4">
                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">{entry._id}</div>
                <div className="mt-1.5 text-lg font-black text-red-600">₹{Number(entry.total || 0).toFixed(2)}</div>
                <div className="text-[10px] text-neutral-500 font-bold mt-0.5">{entry.count} entries</div>
              </div>
            ))}
            {(summary.monthlySeries || []).length === 0 && (
              <div className="col-span-full py-8 text-center text-neutral-400 font-bold flex flex-col items-center justify-center">
                <span>No expense data found.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="rounded-3xl border border-neutral-200/60 bg-white p-5 shadow-sm">
        <h2 className="text-base font-black text-neutral-800 border-b border-neutral-100 pb-3 mb-4">
          Recent Expenses
        </h2>
        <div className="grid gap-3">
          {expenses.map((expense) => (
            <div key={expense._id} className="flex flex-col gap-3 rounded-2xl bg-neutral-50 border border-neutral-100/70 p-4 sm:flex-row sm:items-center sm:justify-between text-xs font-semibold">
              <div>
                <div className="font-black text-sm text-neutral-800">{expense.title}</div>
                <div className="text-neutral-500 mt-1 font-bold">{expense.category} · {expense.quantity} units · {new Date(expense.purchaseDate).toLocaleDateString()}</div>
                <div className="text-[10px] text-neutral-400 mt-1">{expense.notes || "No notes"}</div>
              </div>
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="text-base font-black text-red-600">₹{Number(expense.amount || 0).toFixed(2)}</div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => editExpense(expense)} className="rounded-xl bg-white p-2.5 text-neutral-500 hover:text-neutral-800 border border-neutral-200 shadow-sm"><FaPen size={9} /></button>
                  <button type="button" onClick={() => remove(expense._id)} className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:text-red-700 border border-red-100"><FaTrash size={9} /></button>
                </div>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-10 text-neutral-400 font-bold flex flex-col items-center justify-center">
              <span>No expenses recorded yet.</span>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
