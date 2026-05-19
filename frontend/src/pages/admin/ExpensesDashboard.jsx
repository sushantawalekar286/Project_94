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
    ["Total monthly expenses", `₹${Number(summary.monthTotal || 0).toFixed(2)}`, FaMoneyBillWave],
    ["Today's expenses", `₹${Number(summary.todayTotal || 0).toFixed(2)}`, FaCalendarDay],
    ["This week's expenses", `₹${Number(summary.weekTotal || 0).toFixed(2)}`, FaCalendarWeek]
  ]), [summary]);

  return (
    <section className="px-4 py-6 sm:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-gold-400">Material usage tracker</p>
      <h1 className="mt-2 text-4xl font-black">Expenses Dashboard</h1>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-card">
            <Icon className="text-2xl text-gold-400" />
            <p className="mt-5 text-sm text-white/55">{label}</p>
            <p className="mt-1 truncate text-2xl font-black">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-xl font-black">{editingId ? "Edit Expense" : "Add Expense"}</h2>
          <input className="input-field mb-3" placeholder="Material name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input-field mb-3" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input-field mb-3" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <input className="input-field mb-3" type="number" min="0" placeholder="Cost" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <input className="input-field mb-3" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required />
          <textarea className="input-field mb-3 min-h-24" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="w-full rounded-xl bg-gold-500 px-4 py-3 font-bold text-black">
            {editingId ? <><FaPen className="mr-2 inline" />Update Expense</> : <><FaMoneyBillWave className="mr-2 inline" />Add Expense</>}
          </button>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-xl font-black">Monthly Reports</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(summary.monthlySeries || []).map((entry) => (
              <div key={entry._id} className="rounded-2xl bg-black/30 p-4">
                <div className="text-sm text-white/55">{entry._id}</div>
                <div className="mt-2 text-lg font-black text-gold-400">₹{Number(entry.total || 0).toFixed(2)}</div>
                <div className="text-xs text-white/45">{entry.count} entries</div>
              </div>
            ))}
            {(summary.monthlySeries || []).length === 0 && <p className="text-white/55">No expense data found.</p>}
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
        <h2 className="mb-4 text-xl font-black">Recent Expenses</h2>
        <div className="grid gap-3">
          {expenses.map((expense) => (
            <div key={expense._id} className="flex flex-col gap-3 rounded-2xl bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-bold">{expense.title}</div>
                <div className="text-sm text-white/50">{expense.category} · {expense.quantity} units · {new Date(expense.purchaseDate).toLocaleDateString()}</div>
                <div className="text-xs text-white/45">{expense.notes || "No notes"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-lg font-black text-gold-400">₹{Number(expense.amount || 0).toFixed(2)}</div>
                <button type="button" onClick={() => editExpense(expense)} className="rounded-xl bg-white/10 p-3 text-gold-400"><FaPen /></button>
                <button type="button" onClick={() => remove(expense._id)} className="rounded-xl bg-red-500/10 p-3 text-red-300"><FaTrash /></button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-white/55">No expenses recorded yet.</p>}
        </div>
      </div>
    </section>
  );
}
